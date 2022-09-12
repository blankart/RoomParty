import dynamic from "next/dynamic";
import React, { forwardRef } from "react";
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
    <div className="w-full max-h-screen overflow-scroll bg-slate-900">
      <div className="relative w-full aspect-video bg-slate-800">
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
      </div>
    </div>
  );
}
