import { useEffect, useRef } from "react";
import _uniqBy from "lodash.uniqby";
import { FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa";
import classNames from "classnames";
import _intersectionBy from "lodash.intersectionby";

export interface VideoChatItemProps {
  stream: MediaStream;
  isMe: boolean;
  name: string;
  picture?: string;
  isMuted: boolean;
  isVideoDisabled: boolean;
}

export default function VideoChatItem(props: VideoChatItemProps) {
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
        <div className="absolute top-0 left-0 z-10 w-5 h-auto p-1 overflow-hidden text-xs rounded-full bg-secondary aspect-square">
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
              "-scale-x-100": props.isMe,
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
