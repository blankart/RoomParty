import classNames from "classnames";
import { useEffect, useState } from "react";
import { FaPause, FaPlay, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import _debounce from "lodash.debounce";
import { convertTimeToFormattedTime } from "@rooms2watch/shared-lib";
import { PlayerStatus } from "@rooms2watch/trpc";

export interface ReactPlayerControlBarProps {
  isPlayed: boolean;
  onPlay: () => any;
  onPause: () => any;
  duration: number;
  scrubTime: number;
  onSeek: (time: number) => any;
  setVolume: (volume: number) => any;
  volume: number;
  url: string;
  isBuffering: boolean;
  hasEnded: boolean;
  isLive: boolean;
  isMuted: boolean;
  setMuted: (muted: boolean) => any;
  hasInitiallyPlayed: boolean;
  isControlsDisabled: boolean;
  lastPlayerStatus: PlayerStatus | null;
}

export default function ReactPlayerControlBar(
  props: ReactPlayerControlBarProps
) {
  const [movingScrubTime, setMovingScrubTime] = useState(props.scrubTime);
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);

  useEffect(() => {
    if (!props.lastPlayerStatus) return;
    setShowPlayerStatus(true);
    const timeout = setTimeout(() => {
      setShowPlayerStatus(false);
    }, 3_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [props.lastPlayerStatus]);

  useEffect(() => {
    if (!props.isPlayed || props.isBuffering || props.hasEnded) return;

    const timeout = setTimeout(() => {
      setMovingScrubTime((t) => t + 1);
    }, 1_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [props.isPlayed, movingScrubTime, props.isBuffering, props.hasEnded]);

  useEffect(() => {
    if (props.scrubTime !== movingScrubTime)
      setMovingScrubTime(props.scrubTime);
  }, [props.scrubTime]);

  const timestamp = convertTimeToFormattedTime(
    props.url ? props.duration - movingScrubTime : 0
  );

  const VolumeIcon = props.isMuted ? FaVolumeMute : FaVolumeUp;

  const shouldDisableTimeControl = !props.url;

  const shouldDisablePlayButton =
    !props.url || props.hasEnded || props.duration <= props.scrubTime;

  return (
    <>
      <div
        className={classNames(
          "absolute bottom-8 left-[50%] translate-x-[-50%] text-xs md:text-sm p-1 px-2 text-center w-full badge badge-primary z-[1] opacity-0 h-fit duration-300 translate-y-[20px]",
          showPlayerStatus && "opacity-100 translate-y-0"
        )}
      >
        {props.lastPlayerStatus?.type === "CHANGE_URL"
          ? `${props.lastPlayerStatus?.name} changed the video.`
          : props.lastPlayerStatus?.type === "PAUSED"
          ? `${props.lastPlayerStatus?.name} paused the video.`
          : props.lastPlayerStatus?.type === "PLAYED"
          ? `${props.lastPlayerStatus?.name} played the video.`
          : `${props.lastPlayerStatus?.name} is skipping the video.`}
      </div>
      <div
        className={classNames(
          "flex duration-300 items-center w-full h-8 gap-2 bg-base-100 z-[2]",
          {
            "h-0 overflow-hidden":
              !props.hasInitiallyPlayed || props.isControlsDisabled,
          }
        )}
      >
        <button
          className={classNames(
            "flex items-center justify-center h-full p-2 btn btn-xs btn-ghost relative",
            shouldDisablePlayButton && "btn-disabled"
          )}
          onClick={props.isPlayed ? props.onPause : props.onPlay}
        >
          {props.isPlayed ? (
            <FaPause className="w-4 h-auto" />
          ) : (
            <FaPlay className="w-4 h-auto" />
          )}
        </button>
        <div className="relative flex items-center flex-1 py-2">
          <input
            type="range"
            className={classNames("range range-secondary range-xs", {
              "opacity-40 pointer-events-none": shouldDisableTimeControl,
            })}
            min="0"
            max={props.duration ?? 0}
            value={movingScrubTime}
            onChange={(e) => {
              const newScrubTime = Number(e.target.value ?? "0");
              props.onSeek(newScrubTime);
              setMovingScrubTime(newScrubTime);
            }}
          />
        </div>
        <div className="flex items-center">
          <div className="relative p-2 text-xs group">
            <VolumeIcon
              role="button"
              className="w-4 h-auto cursor-pointer"
              onClick={() => props.setMuted(!props.isMuted)}
            />
            <div className="absolute w-[100px] left-[50%] translate-x-[-50%] z-10 bottom-[200%] -rotate-90 bg-base-100 p-1 opacity-0 group-hover:opacity-100">
              <input
                min="0"
                max="100"
                value={props.volume ?? 100}
                type="range"
                className=" range range-secondary range-xs"
                onChange={(e) => {
                  props.setVolume(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div className="w-[70px] p-2 text-xs">
            {props.isLive ? (
              <button
                onClick={async () => {
                  if (props.duration === Infinity) {
                    await props.onSeek(100);
                    return;
                  }

                  await props.onSeek(props.duration);
                }}
              >
                <span
                  className={classNames(
                    "inline-block mr-2 align-middle rounded-full badge badge-xs",
                    {
                      "badge-error":
                        props.duration === Infinity
                          ? Math.abs(props.scrubTime - 100) < 2
                          : Math.abs(props.scrubTime - props.duration) < 10,
                    }
                  )}
                />
                LIVE
              </button>
            ) : (
              <>-{timestamp}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
