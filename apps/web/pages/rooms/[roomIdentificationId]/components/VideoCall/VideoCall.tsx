import { APP_NAME } from "@web/../../packages/shared-lib";
import { useRouter } from "next/router";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "../../context/RoomContext";
import _uniqBy from "lodash.uniqby";
import uniqBy from "lodash.uniqby";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import { FaVideo } from "react-icons/fa";
import Button from "@web/components/Button/Button";

function Video(props: {
  stream: MediaStream;
  isMe: boolean;
  name: string;
  picture?: string;
}) {
  const localVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!localVideo.current) return;
    localVideo.current.srcObject = props.stream;
    if (props.isMe) localVideo.current.muted = true;
  }, []);

  return (
    <div className="relative">
      {!!props.picture ? (
        <img
          className="absolute top-0 right-0 w-5 h-auto rounded-full !m-0 z-[1]"
          src={props.picture}
        />
      ) : (
        <span className="absolute top-0 right-0 w-5 rounded-full z-[1] badge badge-secondary aspect-square">
          {props.name.substring(0, 1).toUpperCase()}
        </span>
      )}
      <video
        className="rounded-lg !m-0 h-full w-full object-cover relative aspect-square ring-2 ring-primary"
        ref={localVideo}
        autoPlay
        loop
        playsInline
      ></video>
    </div>
  );
}

export default function VideoCall() {
  const peerRef = useRef<Peer | null>(null);
  const [peerHasInitialized, setPeerHasInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { roomTransientId, localStorageSessionId, password, userName } =
    useRoomContext();
  const router = useRouter();
  const connectedLocalStorageSessionIdsRef = useRef<number[]>([]);
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;

  const [mediaStreams, setMediaStreams] = useState<
    {
      stream: MediaStream;
      isMe: boolean;
      localStorageSessionId?: number;
      name: string;
      picture?: string;
    }[]
  >([]);

  const myStreamRef = useRef<MediaStream | null>(null);
  const { user } = useMe();

  const { data: onlineInfo } = trpc.useQuery(
    [
      "rooms.getOnlineInfo",
      {
        roomIdentificationId: roomIdentificationId!,
        password: password! ?? "",
      },
    ],
    {
      enabled: !!roomIdentificationId,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    const peer = peerRef.current;
    if (
      !isEnabled ||
      !peerHasInitialized ||
      !peer ||
      !onlineInfo ||
      !(user ?? userName) ||
      !localStorageSessionId
    )
      return;

    const timeout = setTimeout(() => {
      function cb() {
        console.log(`cb() is called.`);
        const mediaStream = myStreamRef.current!;

        const userForDisplayMetadata = {
          streamId: mediaStream.id,
          localStorageSessionId,
          name: user?.user?.name ?? userName ?? "User",
          picture: user?.user?.picture ?? undefined,
        };

        setMediaStreams((current) =>
          uniqBy(
            [
              ...current,
              {
                stream: mediaStream,
                isMe: true,
                localStorageSessionId: localStorageSessionId!,
                name: user?.user.name ?? userName ?? "User",
                picture: user?.user.picture ?? undefined,
              },
            ],
            (s) => s.stream.id
          )
        );

        peer!.on("connection", (cn) => {
          console.log("received a connection");
          console.log(`${cn.metadata.name} has entered the room`);
          if (
            !connectedLocalStorageSessionIdsRef.current.includes(
              cn.metadata.localStorageSessionId
            )
          ) {
            console.log(
              `no established connection yet. connecting to ${APP_NAME}-room-${roomIdentificationId}-${cn.metadata.localStorageSessionId}`
            );
            peer?.connect(
              `${APP_NAME}-room-${roomIdentificationId}-${cn.metadata.localStorageSessionId}`,
              {
                metadata: userForDisplayMetadata,
              }
            );
          }
          cn.on("close", () => {
            console.log("someone left.");

            connectedLocalStorageSessionIdsRef.current =
              connectedLocalStorageSessionIdsRef.current.filter(
                (lssid) => lssid !== cn.metadata.localStorageSessionId
              );
            setMediaStreams((current) =>
              current.filter(
                (s) =>
                  s.localStorageSessionId !== cn.metadata.localStorageSessionId
              )
            );
          });

          cn.on("error", (error) => {
            console.log("error occurred: ", error);
          });
        });

        peer!.on("call", (call) => {
          call.answer(mediaStream);
          call.on("stream", (remoteStream) => {
            setMediaStreams((current) =>
              uniqBy(
                [
                  ...current,
                  {
                    stream: remoteStream,
                    isMe: false,
                    localStorageSessionId: call.metadata.localStorageSessionId,
                    name: call.metadata.name,
                    picture: call.metadata.picture,
                  },
                ],
                (s) => s.localStorageSessionId
              )
            );
          });
        });

        onlineInfo?.usersForDisplay?.forEach((userForDisplay) => {
          if (userForDisplay.localStorageSessionId === localStorageSessionId)
            return;

          console.log(
            `connecting via \`peer\` to ${APP_NAME}-room-${roomIdentificationId}-${userForDisplay.localStorageSessionId}`,
            userForDisplayMetadata
          );

          const cn = peer?.connect(
            `${APP_NAME}-room-${roomIdentificationId}-${userForDisplay.localStorageSessionId}`,
            {
              metadata: userForDisplayMetadata,
            }
          );

          cn?.on("open", () => {
            connectedLocalStorageSessionIdsRef.current.push(
              userForDisplay.localStorageSessionId
            );
            console.log(`connected via \`peer\` to ${userForDisplay.name}`);
            const conn = peerRef.current?.call(
              `${APP_NAME}-room-${roomIdentificationId}-${userForDisplay.localStorageSessionId}`,
              mediaStream,
              {
                metadata: userForDisplayMetadata,
              }
            );

            conn?.on("stream", (remoteStream) => {
              setMediaStreams((current) =>
                uniqBy(
                  [
                    ...current,
                    {
                      stream: remoteStream,
                      isMe: false,
                      localStorageSessionId:
                        userForDisplay.localStorageSessionId,
                      picture: userForDisplay.picture ?? undefined,
                      name: userForDisplay.name ?? "User",
                    },
                  ],
                  (s) => s.localStorageSessionId
                )
              );
            });
          });
        });
      }

      if (!myStreamRef.current) {
        window.navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((mediaStream) => {
            myStreamRef.current = mediaStream;
            cb();
          });
      } else {
        cb();
      }
    }, 1_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [onlineInfo, user, localStorageSessionId, peerHasInitialized, isEnabled]);

  useEffect(() => {
    if (
      !isEnabled ||
      !roomTransientId ||
      !roomIdentificationId ||
      !localStorageSessionId ||
      peerRef.current ||
      peerHasInitialized
    )
      return;

    const roomPeer = new Peer(
      `${APP_NAME}-room-${roomIdentificationId}-${localStorageSessionId}`
    );

    peerRef.current = roomPeer;

    roomPeer.on("open", () => {
      console.log(
        `connection has been established. peer id: ${APP_NAME}-room-${roomIdentificationId}-${localStorageSessionId}`
      );

      setPeerHasInitialized(true);
    });
  }, [
    roomTransientId,
    roomIdentificationId,
    localStorageSessionId,
    onlineInfo,
    peerHasInitialized,
    isEnabled,
  ]);

  return (
    <>
      {!isEnabled ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-sm text-center max-w-[min(300px,80%)]">
            Video chat with your friends while watching your favorite videos!
          </p>
          <Button
            className="space-x-4 btn-ghost"
            onClick={() => {
              setIsEnabled(true);
            }}
          >
            <FaVideo className="w-6 h-6 md:w-10 md:h-10" />
            <p className="text-xs md:text-md">Enable Video Chat</p>
          </Button>
        </div>
      ) : (
        <div className="grid w-full grid-cols-3 gap-4 lg:grid-cols-2">
          {mediaStreams.map((mediaStream) => (
            <Video key={mediaStream.stream.id} {...mediaStream} />
          ))}
        </div>
      )}
    </>
  );
}
