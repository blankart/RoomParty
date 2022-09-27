import { APP_NAME } from "@web/../../packages/shared-lib";
import { useRouter } from "next/router";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "../../context/RoomContext";
import _uniqBy from "lodash.uniqby";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhone,
  FaPhoneAlt,
  FaSpinner,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import Button from "@web/components/Button/Button";
import classNames from "classnames";
import { InferSubscriptionOutput } from "@web/types/trpc";
import useLocalStorage from "@web/hooks/useLocalStorage";
import _intersectionBy from "lodash.intersectionby";
import VideoCallPeer, { ConnectionMetadata } from "./VideoCallPeer";

function VideoChatItem(props: {
  stream: MediaStream;
  isMe: boolean;
  name: string;
  picture?: string;
  isMuted: boolean;
  isVideoDisabled: boolean;
}) {
  const localVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!localVideo.current) return;
    if (!localVideo.current.srcObject)
      localVideo.current.srcObject = props.stream;
    if (props.isMe) localVideo.current.muted = true;
  }, [props.stream, props.isMuted, props.isVideoDisabled]);

  return (
    <>
      <div className="relative inline-block w-[60px] h-auto p-1 lg:w-full">
        <div className="absolute top-0 left-0 z-10 w-5 h-auto p-1 overflow-hidden text-xs rounded-full bg-primary aspect-square">
          {props.picture ? (
            <img
              className="absolute inset-0 w-full h-full !m-0"
              src={props.picture}
              alt={props.name ?? "User"}
            />
          ) : (
            <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              {props.name?.substring(0, 1)?.toUpperCase()}
            </span>
          )}
        </div>
        {(props.isMuted || props.isVideoDisabled) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 rounded-lg bg-base-100/20">
            {props.isVideoDisabled && <FaVideoSlash className="w-3 h-auto" />}
            {props.isMuted && <FaMicrophoneSlash className="w-3 h-auto" />}
          </div>
        )}

        <video
          className={classNames(
            "rounded-lg !m-0 h-full w-full object-cover relative aspect-square ring-2",
            {
              "ring-transparent": !props.isMe,
              "ring-amber-500": props.isMe,
            }
          )}
          ref={localVideo}
          autoPlay
          loop
          playsInline
        />
      </div>
    </>
  );
}

export default function VideoCall() {
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
      enabled: videoCallPeerHasInitialized,
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

  return (
    <>
      <div className="w-full p-2 px-4 overflow-y-auto">
        <>
          {joinedVideoChat ? (
            <>
              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <h2 className="hidden lg:block lg:text-xl !m-0">Video Chat</h2>
                {isJoiningChat && (
                  <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                    <FaSpinner className="w-5 h-auto lg:w-10 animate-spin" />
                  </div>
                )}
                <div className="w-full h-auto lg:h-[30vh]  overflow-y-auto">
                  <div className="block w-full space-x-2 overflow-x-auto whitespace-nowrap lg:grid lg:grid-cols-2 lg:space-x-0 lg:gap-4">
                    {!isJoiningChat &&
                      mediaStreams.map((ms) => (
                        <VideoChatItem
                          key={ms.stream.id}
                          stream={ms.stream}
                          isMe={ms.metadata.isMe}
                          isMuted={ms.metadata.isMuted}
                          isVideoDisabled={ms.metadata.isVideoDisabled}
                          name={ms.metadata.name}
                          picture={ms.metadata.picture}
                        />
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end w-full gap-2 mt-0 lg:mt-4">
                <Button
                  className={classNames(
                    "btn-xs sm:btn-sm md:btn-md rounded-full",
                    isMuted && "btn-error"
                  )}
                  onClick={videoCallPeerRef.current?.toggleAudio.bind(
                    videoCallPeerRef.current
                  )}
                >
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </Button>

                <Button
                  className={classNames(
                    "btn-xs sm:btn-sm md:btn-md rounded-full",
                    isVideoDisabled && "btn-error"
                  )}
                  onClick={videoCallPeerRef.current?.toggleVideo.bind(
                    videoCallPeerRef.current
                  )}
                >
                  {isVideoDisabled ? <FaVideoSlash /> : <FaVideo />}
                </Button>

                <Button
                  className="rounded-full btn-xs sm:btn-sm md:btn-md btn-error"
                  onClick={() => setJoinedVideoChat(false)}
                >
                  <FaPhone />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-col items-center justify-center hidden gap-4 lg:flex">
                <p className="text-sm text-center max-w-[min(300px,80%)]">
                  Video chat with your friends while watching your favorite
                  videos!
                </p>
                <Button
                  className="space-x-4 btn-ghost"
                  onClick={() => setJoinedVideoChat(true)}
                >
                  <FaVideo className="w-6 h-6 lg:w-10 lg:h-10" />
                  <p className="text-xs lg:text-md">Join Video Chat</p>
                </Button>
              </div>

              <div className="flex items-center lg:hidden">
                <p className="!m-0 text-sm text-center">
                  Enter the video chat with your friends!
                </p>
                <Button
                  className="btn-ghost btn-xs"
                  onClick={() => setJoinedVideoChat(true)}
                >
                  <FaVideo className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </>
      </div>
    </>
  );
}
