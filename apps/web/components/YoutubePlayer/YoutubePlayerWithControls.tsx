import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import useYoutubePlayerWithControls from "./useYoutubePlayerWithControls";
import YoutubePlayerSetup from "./YoutubePlayerSetup";

const YoutubePlayer = dynamic(
  () => import("@web/components/YoutubePlayer/YoutubePlayer"),
  {
    ssr: false,
  }
);

export interface YoutubePlayerWithControlsProps {}

const YOUTUBE_PLAYER_CONFIG = {
  playerVars: { origin: process.env.NEXT_PUBLIC_WEB_BASE_URL },
};

const YOUTUBE_PLAYER_PROGRESS_INTERVAL = 1_000;

export default function YoutubePlayerWithControls(
  props: YoutubePlayerWithControlsProps
) {
  const ctx = useYoutubePlayerWithControls(props);

  return (
    <div className="flex-1 w-full max-h-screen overflow-y-auto bg-base-100">
      <div className="relative w-full h-full bg-base-100">
        <Suspense>
          <YoutubePlayerSetup />
          <YoutubePlayer
            onStart={ctx.onStart}
            onPause={ctx.onPause}
            onPlay={ctx.onPlay}
            onSeek={ctx.onSeek}
            progressInterval={YOUTUBE_PLAYER_PROGRESS_INTERVAL}
            stopOnUnmount
            controls
            youtubePlayerRef={ctx.youtubePlayerRef}
            width="100%"
            height="100%"
            url={ctx.url}
            config={YOUTUBE_PLAYER_CONFIG}
          />
        </Suspense>
      </div>
    </div>
  );
}
