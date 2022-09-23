import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";

import YoutubeVideoSearchButton from "./YoutubeVideoSearchButton";
const YoutubeVideoSearch = dynamic(() => import("./YoutubeVideoSearch"), {
  ssr: false,
});

export default function VideoSearch() {
  const [videoSearchModalOpen, setVideoSearchModalOpen] = useState<
    null | "youtube"
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

      <div
        className={classNames(
          "absolute z-10 bottom-4 right-4 duration-100 flex gap-4",
          {}
        )}
      >
        <YoutubeVideoSearchButton
          showVideoSearch={videoSearchModalOpen === "youtube"}
          onOpenModal={() => setVideoSearchModalOpen("youtube")}
          onCloseModal={() => setVideoSearchModalOpen(null)}
        />
      </div>
    </>
  );
}
