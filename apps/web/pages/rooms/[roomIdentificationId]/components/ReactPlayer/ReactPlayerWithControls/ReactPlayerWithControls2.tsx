import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useReactPlayerContext } from "../context/ReactPlayerContext";
import _debounce from "lodash.debounce";
import ReactPlayerWithControlsSetup from "./components/ReactPlayerWithControlsSetup";
import ReactPlayerControlBar from "./components/ReactPlayerControlBar";
import useReactPlayerWithControls2 from "./hooks/useReactPlayerWitnControls2";
import ReactPlayerRoomInfo from "./components/ReactPlayerRoomInfo";
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
  const { reactPlayerProps } = useReactPlayerContext();
  const { control, player, setup, roomInfo } = useReactPlayerWithControls2();
  return (
    <Suspense>
      <div className="flex flex-col flex-1 w-full max-h-screen bg-base-100">
        <div className="relative flex flex-col flex-1 w-full bg-base-100">
          <Suspense>
            <ReactPlayerWithControlsSetup {...setup} />
            <div className="relative w-full h-full">
              <button
                className="absolute inset-0 z-[1]"
                onClick={!control.isPlayed ? control.onPlay : control.onPause}
              />
              <ReactPlayer
                pip
                stopOnUnmount
                controls={false}
                style={{ pointerEvents: "none" }}
                width="100%"
                height="100%"
                {...reactPlayerProps}
                {...player}
              />
            </div>
            <ReactPlayerControlBar {...control} />
          </Suspense>
        </div>
        <div className="p-4 py-3 md:py-6 bg-base-200">
          {!!roomInfo && <ReactPlayerRoomInfo {...roomInfo} />}
        </div>
      </div>
    </Suspense>
  );
}
