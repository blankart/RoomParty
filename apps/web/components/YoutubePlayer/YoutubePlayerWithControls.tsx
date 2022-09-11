import dynamic from "next/dynamic";
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

  if (!ctx.url) {
    return <YoutubePlayerSetup />;
  }

  return (
    <div className="w-full bg-slate-800">
      <YoutubePlayer
        onStart={() => {
          if (ctx.playerStatus) {
            ctx.setWatchState({
              ...(ctx.playerStatus.time
                ? { scrubTime: ctx.playerStatus.time }
                : {}),

              ...(ctx.playerStatus.type !== "PAUSED"
                ? {
                    isPlayed: false,
                  }
                : {}),
            });
          }
        }}
        onPause={() => {
          ctx.url &&
            ctx.control({
              id: ctx.id!,
              statusObject: {
                sessionId: ctx.sessionId,
                time: ctx.youtubePlayerRef?.current?.getCurrentTime() ?? 0,
                type: "PAUSED",
                name: ctx.userName!,
                url: ctx.url,
              },
            });
        }}
        onPlay={() => {
          ctx.url &&
            ctx.control({
              id: ctx.id!,
              statusObject: {
                sessionId: ctx.sessionId,
                type: "PLAYED",
                time: ctx.youtubePlayerRef?.current?.getCurrentTime() ?? 0,
                name: ctx.userName!,
                url: ctx.url,
              },
            });
        }}
        onSeek={(time) => {
          ctx.url &&
            ctx.control({
              id: ctx.id!,
              statusObject: {
                sessionId: ctx.sessionId,
                name: ctx.userName!,
                type: "SEEK_TO",
                time,
                url: ctx.url,
              },
            });
        }}
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
  );
}
