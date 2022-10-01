import { useRouter } from "next/router";
import { memo, useState } from "react";
import classNames from "classnames";
import dynamic from "next/dynamic";

import { trpc } from "@web/api";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";

import FacebookVideoSearchButton from "./components/FacebookVideoSearchButton";
import MixcloudAudioSearchButton from "./components/MixcloudAudioSearchButton";
import SoundCloudAudioSearchButton from "./components/SoundCloudAudioSearchButton";
import TwitchVideoSearchButton from "./components/TwitchVideoSearchButton";
import VimeoVideoSearchButton from "./components/VimeoVideoSearchButton";
import YoutubeVideoSearchButton from "./components/YoutubeVideoSearchButton";

const FacebookVideoSearch = dynamic(
  () => import("./components/FacebookVideoSearch"),
  {
    ssr: false,
  }
);

const MixcloudAudioSearch = dynamic(
  () => import("./components/MixcloudAudioSearch"),
  {
    ssr: false,
  }
);

const SoundCloudAudioSearch = dynamic(
  () => import("./components/SoundCloudAudioSearch"),
  {
    ssr: false,
  }
);

const TwitchVideoSearch = dynamic(
  () => import("./components/TwitchVideoSearch"),
  {
    ssr: false,
  }
);

const VimeoVideoSearch = dynamic(
  () => import("./components/VimeoVideoSearch"),
  {
    ssr: false,
  }
);
const YoutubeVideoSearch = dynamic(
  () => import("./components/YoutubeVideoSearch"),
  {
    ssr: false,
  }
);

export default memo(function VideoSearch() {
  const [videoSearchModalOpen, setVideoSearchModalOpen] = useState<
    | null
    | "youtube"
    | "twitch"
    | "facebook"
    | "vimeo"
    | "mixcloud"
    | "soundcloud"
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

      {videoSearchModalOpen === "soundcloud" && (
        <SoundCloudAudioSearch
          showVideoSearch={videoSearchModalOpen === "soundcloud"}
          onOpenModal={() => setVideoSearchModalOpen("soundcloud")}
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

            <SoundCloudAudioSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("soundcloud")}
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

          <SoundCloudAudioSearchButton
            showVideoSearch={!!videoSearchModalOpen}
            onOpenModal={() => setVideoSearchModalOpen("soundcloud")}
            onCloseModal={() => setVideoSearchModalOpen(null)}
          />
        </div>
      )}
    </>
  );
});
