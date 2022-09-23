import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useReactPlayerContext } from "../context/ReactPlayerContext";
import _debounce from "lodash.debounce";
import ReactPlayerControlBar from "./components/ReactPlayerControlBar";
import useReactPlayerWithControls2 from "./hooks/useReactPlayerWithControls2";
import ReactPlayerRoomInfo from "./components/ReactPlayerRoomInfo";
import VideoSearch from "./components/VideoSearch/VideoSearch";
const ReactPlayer = dynamic(
  () =>
    import(
      "@web/pages/rooms/[roomIdentificationId]/components/ReactPlayer/ReactPlayer"
    ),
  {
    ssr: false,
  }
);

export default function ReactPlayerWithControls2() {
  const {
    reactPlayerProps,
    hasInitiallyPlayed,
    url,
    hasEnded,
    duration,
    scrubTime,
  } = useReactPlayerContext();
  const { control, player, roomInfo } = useReactPlayerWithControls2();
  return (
    <Suspense>
      <div className="flex flex-col flex-1 w-full max-h-screen bg-base-100">
        <div className="relative flex flex-col flex-1 w-full bg-base-100">
          <div className="relative w-full h-full group">
            {!control.isControlsDisabled && <VideoSearch roomInfo={roomInfo} />}
            {((!!url && hasInitiallyPlayed) || control.isControlsDisabled) && (
              <button
                className="absolute inset-0 z-[1]"
                onClick={
                  !hasEnded && scrubTime < duration
                    ? !control.isPlayed
                      ? control.onPlay
                      : control.onPause
                    : () => {}
                }
              />
            )}
            <ReactPlayer {...reactPlayerProps} {...player} />
          </div>
          <ReactPlayerControlBar {...control} />
        </div>
        <div className="p-4 py-3 md:py-6 bg-base-200">
          {!!roomInfo && <ReactPlayerRoomInfo {...roomInfo} />}
        </div>
      </div>
    </Suspense>
  );
}
