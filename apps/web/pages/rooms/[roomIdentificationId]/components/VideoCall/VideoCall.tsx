import _uniqBy from "lodash.uniqby";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhone,
  FaSpinner,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import Button from "@web/components/Button/Button";
import classNames from "classnames";
import _intersectionBy from "lodash.intersectionby";

import dynamic from "next/dynamic";
import useVideoCall from "./hooks/useVideoCall";
import { memo } from "react";
const VideoChatItem = dynamic(() => import("./components/VideoCallItem"), {
  ssr: false,
});

export default memo(function VideoCall() {
  const ctx = useVideoCall();
  return (
    <>
      <div className="w-full p-2 px-4 overflow-y-auto">
        <>
          {ctx.joinedVideoChat ? (
            <>
              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <h2 className="hidden lg:block lg:text-xl !m-0">Video Chat</h2>
                {ctx.isJoiningChat && (
                  <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                    <FaSpinner className="w-5 h-auto lg:w-10 animate-spin" />
                  </div>
                )}
                <div className="w-full h-auto lg:h-[30vh]  overflow-y-auto">
                  <div className="block w-full space-x-2 overflow-x-auto whitespace-nowrap lg:grid lg:grid-cols-2 lg:space-x-0 lg:gap-4">
                    {!ctx.isJoiningChat &&
                      ctx.mediaStreams.map((ms) => (
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
                    ctx.isMuted && "btn-error"
                  )}
                  onClick={ctx.videoCallPeerRef.current?.toggleAudio.bind(
                    ctx.videoCallPeerRef.current
                  )}
                >
                  {ctx.isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </Button>

                <Button
                  className={classNames(
                    "btn-xs sm:btn-sm md:btn-md rounded-full",
                    ctx.isVideoDisabled && "btn-error"
                  )}
                  onClick={ctx.videoCallPeerRef.current?.toggleVideo.bind(
                    ctx.videoCallPeerRef.current
                  )}
                >
                  {ctx.isVideoDisabled ? <FaVideoSlash /> : <FaVideo />}
                </Button>

                <Button
                  className="rounded-full btn-xs sm:btn-sm md:btn-md btn-error"
                  onClick={() => ctx.setJoinedVideoChat(false)}
                >
                  <FaPhone />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-col items-center justify-center hidden gap-4 lg:flex">
                <p className="text-xl text-center max-w-[min(300px,80%)] font-bold">
                  Video chat with your friends while watching your favorite
                  videos!
                </p>
                <Button
                  className="space-x-4 font-bold btn-ghost"
                  onClick={() => ctx.setJoinedVideoChat(true)}
                >
                  <FaVideo className="w-6 h-6 text-green-500 lg:w-10 lg:h-10 animate-pulse" />
                  <p className="text-xs lg:text-md">Join Video Chat</p>
                </Button>
              </div>

              <div className="flex items-center lg:hidden">
                <p className="!m-0 text-sm text-center font-bold">
                  Enter the video chat with your friends!
                </p>
                <Button
                  className="btn-ghost btn-xs"
                  onClick={() => ctx.setJoinedVideoChat(true)}
                >
                  <FaVideo className="w-4 h-auto text-green-500 animate-pulse" />
                </Button>
              </div>
            </>
          )}
        </>
      </div>
    </>
  );
});
