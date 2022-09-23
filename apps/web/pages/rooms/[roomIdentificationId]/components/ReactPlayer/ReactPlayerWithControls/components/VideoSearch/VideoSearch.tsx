import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";
import TwitchVideoSearch from "./components/TwitchVideoSearch";
import TwitchVideoSearchButton from "./components/TwitchVideoSearchButton";

import YoutubeVideoSearchButton from "./components/YoutubeVideoSearchButton";
const YoutubeVideoSearch = dynamic(
  () => import("./components/YoutubeVideoSearch"),
  {
    ssr: false,
  }
);

export default function VideoSearch() {
  const [videoSearchModalOpen, setVideoSearchModalOpen] = useState<
    null | "youtube" | "twitch"
  >(null);

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
          onOpenModal={() => setVideoSearchModalOpen("youtube")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      )}

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
      </div>
    </>
  );
}
