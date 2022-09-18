import { RefObject } from "react";
import _YoutubePlayer, { YouTubePlayerProps } from "react-player/youtube";

export default function YoutubePlayer({
  youtubePlayerRef,
  ...props
}: YouTubePlayerProps & { youtubePlayerRef: RefObject<_YoutubePlayer> }) {
  return <_YoutubePlayer {...props} ref={youtubePlayerRef} />;
}
