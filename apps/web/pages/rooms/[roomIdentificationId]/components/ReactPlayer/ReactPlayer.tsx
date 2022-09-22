import React, { RefObject } from "react";
import _ReactPlayer, { ReactPlayerProps } from "react-player";

const YOUTUBE_PLAYER_CONFIG = {
  playerVars: { origin: process.env.NEXT_PUBLIC_WEB_BASE_URL },
};

export default function ReactPlayer({
  reactPlayerRef,
  ...props
}: ReactPlayerProps & { reactPlayerRef: RefObject<_ReactPlayer> }) {
  return (
    <_ReactPlayer
      ref={reactPlayerRef}
      config={{
        youtube: YOUTUBE_PLAYER_CONFIG,
      }}
      {...props}
    />
  );
}
