import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "../../../context/RoomContext";
import _uniqBy from "lodash.uniqby";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import { InferSubscriptionOutput } from "@web/types/trpc";
import _intersectionBy from "lodash.intersectionby";
import VideoCallPeer, { ConnectionMetadata } from "../VideoCallPeer";

export default function useVideoCall() {
  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;
  const { user } = useMe();
  const { roomTransientId, localStorageSessionId, password, userName } =
    useRoomContext();

  const videoCallPeerRef = useRef<VideoCallPeer | null>(null);
  const [videoCallPeerHasInitialized, setVideoCallPeerHasInitialized] =
    useState(false);

  const initialIsMutedValueRef = useRef<boolean>(true);
  const initialIsVideoDisabledRef = useRef<boolean>(true);
  const [mediaStreams, setMediaStreams] = useState<
    { stream: MediaStream; metadata: ConnectionMetadata & { isMe: boolean } }[]
  >([]);

  const [joinedVideoChat, setJoinedVideoChat] = useState(false);
  const [isJoiningChat, setIsJoiningChat] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoDisabled, setIsVideoDisabled] = useState(true);

  const { mutateAsync: broadcastStateChange } = trpc.useMutation([
    "video-chat.broadcastStateChange",
  ]);

  useEffect(() => {
    if (
      !roomTransientId ||
      !joinedVideoChat ||
      !videoCallPeerRef.current ||
      !localStorageSessionId ||
      !joinedVideoChat
    )
      return;

    broadcastStateChange({
      ...videoCallPeerRef.current.myMetadata,
      roomIdentificationId: roomIdentificationId!,
      localStorageSessionId,
      isMuted,
      isVideoDisabled,
    });
  }, [isMuted, isVideoDisabled]);

  useEffect(() => {
    if (
      !roomTransientId ||
      !joinedVideoChat ||
      videoCallPeerRef.current ||
      !localStorageSessionId
    )
      return;
    setIsJoiningChat(true);
    videoCallPeerRef.current = new VideoCallPeer(
      {
        roomTransientId,
        user,
        userName,
      },
      function whenDoneInitialized(instance) {
        initialIsMutedValueRef.current = instance.isMuted;
        initialIsVideoDisabledRef.current = instance.isVideoDisabled;
        setIsMuted(instance.isMuted);
        setIsVideoDisabled(instance.isVideoDisabled);
        setIsJoiningChat(false);

        setVideoCallPeerHasInitialized(true);
      },

      function whenVideoStateChanged(instance) {
        setMediaStreams([
          {
            stream: instance.myMediaStream,
            metadata: {
              ...instance.myMetadata,
              isMe: true,
            },
          },
          ...instance.remoteStreams.map((rs) => ({
            ...rs,
            metadata: {
              ...rs.metadata,
              isMe: false,
            },
          })),
        ]);
        setIsMuted(instance.isMuted);
        setIsVideoDisabled(instance.isVideoDisabled);
      }
    );

    return () => {
      videoCallPeerRef.current?.cleanUp();
      videoCallPeerRef.current = null;
      initiallyFetchedVideoPeersRef.current = false;
      previousDataRef.current = [];
      setVideoCallPeerHasInitialized(false);
    };
  }, [roomTransientId, joinedVideoChat]);

  const previousDataRef = useRef<
    ReturnType<
      InferSubscriptionOutput<"video-chat.videoChatSubscription">["output"]
    >
  >([]);

  const initiallyFetchedVideoPeersRef = useRef<boolean>(false);

  trpc.useSubscription(
    [
      "video-chat.videoChatSubscription",
      {
        isMuted: initialIsMutedValueRef.current,
        isVideoDisabled: initialIsVideoDisabledRef.current,
        localStorageSessionId: localStorageSessionId!,
        roomIdentificationId: roomIdentificationId!,
        password: password ?? "",
      },
    ],
    {
      enabled: videoCallPeerHasInitialized && joinedVideoChat,
      onNext(data) {
        const { entered, left, stateChanged } =
          videoCallPeerRef.current!.getVideoChatSubscriptionChanges(
            previousDataRef.current,
            data
          );

        if (!initiallyFetchedVideoPeersRef.current) {
          videoCallPeerRef.current!.handleWhenSomeoneEntered(entered);
          initiallyFetchedVideoPeersRef.current = true;
        }

        videoCallPeerRef.current!.handleWhenSomeoneStateChanged(stateChanged);
        videoCallPeerRef.current!.handleWhenSomeoneLeft(left);

        previousDataRef.current = data;
      },
    }
  );

  return {
    joinedVideoChat,
    isJoiningChat,
    mediaStreams,
    isMuted,
    isVideoDisabled,
    videoCallPeerRef,
    setJoinedVideoChat,
  };
}
