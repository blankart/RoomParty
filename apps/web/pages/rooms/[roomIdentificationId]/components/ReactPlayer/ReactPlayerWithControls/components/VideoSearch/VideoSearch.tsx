import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useReactPlayerContext } from "../../../context/ReactPlayerContext";
import useReactPlayerWithControls2 from "../../hooks/useReactPlayerWithControls2";
import TwitchVideoSearch from "./components/TwitchVideoSearch";
import TwitchVideoSearchButton from "./components/TwitchVideoSearchButton";

import YoutubeVideoSearchButton from "./components/YoutubeVideoSearchButton";
const YoutubeVideoSearch = dynamic(
  () => import("./components/YoutubeVideoSearch"),
  {
    ssr: false,
  }
);

export default function VideoSearch(props: {
  roomInfo: ReturnType<typeof useReactPlayerWithControls2>["roomInfo"];
}) {
  const [videoSearchModalOpen, setVideoSearchModalOpen] = useState<
    null | "youtube" | "twitch"
  >(null);

  const { url } = useReactPlayerContext();

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

      {!url ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-sm md:text-md">
          <h3>Welcome to {props.roomInfo?.name}&apos;s room!</h3>
          <p>Select a video platform</p>
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
        </div>
      )}
    </>
  );
}
