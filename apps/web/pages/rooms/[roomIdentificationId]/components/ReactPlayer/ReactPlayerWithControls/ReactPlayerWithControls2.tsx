import dynamic from "next/dynamic";
import { memo, Suspense } from "react";
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

export default memo(function ReactPlayerWithControls2() {
  const {
    reactPlayerProps,
    hasInitiallyPlayed,
    url,
    hasEnded,
    duration,
    scrubTime,
    isLive,
  } = useReactPlayerContext();
  const { control, player, roomInfo } = useReactPlayerWithControls2();

  const showPlayPauseOverlay =
    (!!url && hasInitiallyPlayed) || control.isControlsDisabled;

  return (
    <Suspense>
      <div className="flex flex-col flex-1 w-full max-h-screen bg-base-100">
        <div className="relative flex flex-col flex-1 w-full bg-base-100">
          <div className="relative w-full h-full group video-container">
            {!control.isControlsDisabled && <VideoSearch />}
            {/* {showPlayPauseOverlay && (
              <button
                aria-label={control.isPlayed ? "Pause video" : "Play video"}
                className="absolute inset-0 z-[1]"
                onClick={
                  !hasEnded && (scrubTime < duration || isLive)
                    ? !control.isPlayed
                      ? control.onPlay
                      : control.onPause
                    : () => {}
                }
              />
            )} */}
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
});
