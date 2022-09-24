import React, { RefObject, useEffect, useState } from "react";
import _ReactPlayer, { ReactPlayerProps } from "react-player";

const YOUTUBE_PLAYER_CONFIG = {
  playerVars: {
    origin: process.env.NEXT_PUBLIC_WEB_BASE_URL,
    playsinline: 1,
  },
};

const FACEBOOK_PLAYER_CONFIG = {
  appId: "893427181627527",
  attributes: {
    "data-allowfullscreen": false,
  },
};

const VIMEO_PLAYER_CONFIG = {
  playerOptions: {
    playsinline: true,
    controls: false,
  },
};

export default function ReactPlayer({
  reactPlayerRef,
  ...props
}: ReactPlayerProps & { reactPlayerRef: RefObject<_ReactPlayer> }) {
  const [config, setConfig] = useState({
    youtube: YOUTUBE_PLAYER_CONFIG,
    facebook: FACEBOOK_PLAYER_CONFIG,
    vimeo: VIMEO_PLAYER_CONFIG,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const videoContainer = document.querySelector(".video-container");
    if (!videoContainer) {
      setIsReady(true);
      return;
    }

    const containerHeight =
      String(parseInt(window.getComputedStyle(videoContainer).height)) + "px";
    const containerWidth =
      String(parseInt(window.getComputedStyle(videoContainer).width)) + "px";
    setConfig((current) => ({
      ...current,
      facebook: {
        ...current.facebook,
        attributes: {
          ...current.facebook.attributes,
          "data-width": containerWidth,
          "data-height": containerHeight,
        },
      },
    }));

    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <_ReactPlayer playsinline ref={reactPlayerRef} config={config} {...props} />
  );
}
