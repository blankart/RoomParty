import { trpc } from "@web/api";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import FacebookVideoSearch from "./components/FacebookVideoSearch";
import FacebookVideoSearchButton from "./components/FacebookVideoSearchButton";
import MixcloudAudioSearch from "./components/MixcloudAudioSearch";
import MixcloudAudioSearchButton from "./components/MixcloudAudioSearchButton";
import TwitchVideoSearch from "./components/TwitchVideoSearch";
import TwitchVideoSearchButton from "./components/TwitchVideoSearchButton";
import VimeoVideoSearch from "./components/VimeoVideoSearch";
import VimeoVideoSearchButton from "./components/VimeoVideoSearchButton";

import YoutubeVideoSearchButton from "./components/YoutubeVideoSearchButton";
const YoutubeVideoSearch = dynamic(
  () => import("./components/YoutubeVideoSearch"),
  {
    ssr: false,
  }
);

export default memo(function VideoSearch() {
  const [videoSearchModalOpen, setVideoSearchModalOpen] = useState<
    null | "youtube" | "twitch" | "facebook" | "vimeo" | "mixcloud"
  >(null);

  const { password } = useRoomContext();

  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;

  const { isFetchedAfterMount, data, isIdle, isLoading } = trpc.useQuery(
    [
      "rooms.findByRoomIdentificationId",
      {
        roomIdentificationId: roomIdentificationId!,
        password: password ?? "",
      },
    ],
    {
      enabled: !!roomIdentificationId,
    }
  );

  return (
    <>
      {videoSearchModalOpen === "youtube" && (
        <YoutubeVideoSearch
          showVideoSearch={videoSearchModalOpen === "youtube"}
          onOpenModal={() => setVideoSearchModalOpen("youtube")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

      {videoSearchModalOpen === "twitch" && (
        <TwitchVideoSearch
          showVideoSearch={videoSearchModalOpen === "twitch"}
          onOpenModal={() => setVideoSearchModalOpen("twitch")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

      {videoSearchModalOpen === "facebook" && (
        <FacebookVideoSearch
          showVideoSearch={videoSearchModalOpen === "facebook"}
          onOpenModal={() => setVideoSearchModalOpen("facebook")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

      {videoSearchModalOpen === "vimeo" && (
        <VimeoVideoSearch
          showVideoSearch={videoSearchModalOpen === "vimeo"}
          onOpenModal={() => setVideoSearchModalOpen("vimeo")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

      {videoSearchModalOpen === "mixcloud" && (
        <MixcloudAudioSearch
          showVideoSearch={videoSearchModalOpen === "mixcloud"}
          onOpenModal={() => setVideoSearchModalOpen("mixcloud")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

      {isFetchedAfterMount &&
      !(data?.playerStatus as any)?.url &&
      !isIdle &&
      !isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-sm md:text-md">
          <h3>Welcome to {data?.name}&apos;s room!</h3>
          <p className="text-xs md:text-sm">
            Select a video to watch with your friends!
          </p>
          <div className="flex gap-4">
            <YoutubeVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("youtube")}
              onCloseModal={() => setVideoSearchModalOpen(null)}
            />

            <TwitchVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("twitch")}
              onCloseModal={() => setVideoSearchModalOpen(null)}
            />

            <FacebookVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("facebook")}
              onCloseModal={() => setVideoSearchModalOpen(null)}
            />

            <VimeoVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("vimeo")}
              onCloseModal={() => setVideoSearchModalOpen(null)}
            />

            <MixcloudAudioSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("mixcloud")}
              onCloseModal={() => setVideoSearchModalOpen(null)}
            />
          </div>
        </div>
      ) : (
        <div
          className={classNames(
            "absolute z-10 top-4 right-4 duration-100 flex gap-4",
            {
              "pointer-events-none": !!videoSearchModalOpen,
            }
          )}
        >
          <YoutubeVideoSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("youtube")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />

          <TwitchVideoSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("twitch")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />

          <FacebookVideoSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("facebook")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />

          <VimeoVideoSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("vimeo")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />

          <MixcloudAudioSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("mixcloud")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />
        </div>
      )}
    </>
  );
});
