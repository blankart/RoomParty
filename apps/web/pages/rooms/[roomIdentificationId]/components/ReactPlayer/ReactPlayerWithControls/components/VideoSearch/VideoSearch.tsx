import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import classNames from "classnames";
import dynamic from "next/dynamic";

import { trpc } from "@web/trpc";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";

import FacebookVideoSearchButton from "./components/FacebookVideoSearchButton";
import MixcloudAudioSearchButton from "./components/MixcloudAudioSearchButton";
import SoundCloudAudioSearchButton from "./components/SoundCloudAudioSearchButton";
import TwitchVideoSearchButton from "./components/TwitchVideoSearchButton";
import VimeoVideoSearchButton from "./components/VimeoVideoSearchButton";
import YoutubeVideoSearchButton from "./components/YoutubeVideoSearchButton";
import create from "zustand";
import type { VideoPlatform } from "@RoomParty/prisma-client";
import { FaSpinner } from "react-icons/fa";
import { AiFillCloseCircle } from "react-icons/ai";

function ModalLoadingFallback() {
  return (
    <div className="absolute inset-0 w-full z-[10] p-10 overflow-y-auto bg-base-100/90 duration-100 flex items-center justify-center">
      <FaSpinner className="w-8 h-auto duration-100 md:w-20 animate-spin" />
    </div>
  );
}

const FacebookVideoSearch = dynamic(
  () => import("./components/FacebookVideoSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);

const MixcloudAudioSearch = dynamic(
  () => import("./components/MixcloudAudioSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);

const SoundCloudAudioSearch = dynamic(
  () => import("./components/SoundCloudAudioSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);

const TwitchVideoSearch = dynamic(
  () => import("./components/TwitchVideoSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);

const VimeoVideoSearch = dynamic(
  () => import("./components/VimeoVideoSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);
const YoutubeVideoSearch = dynamic(
  () => import("./components/YoutubeVideoSearch"),
  {
    ssr: false,
    loading: ModalLoadingFallback,
  }
);

interface VideoSearchStore {
  videoSearchModalOpen: null | Lowercase<VideoPlatform>;
  setVideoSearchModalOpen: (
    newVideoSearchModalOpen: null | Lowercase<VideoPlatform>
  ) => any;
  showVideoSearchButtons: boolean;
  setShowVideoSearchButtons: (newValue: boolean) => any;
}

export const useVideoSearchStore = create<VideoSearchStore>((set) => ({
  videoSearchModalOpen: null,
  setVideoSearchModalOpen: (newValue) =>
    set((store) => ({ ...store, videoSearchModalOpen: newValue })),
  showVideoSearchButtons: false,
  setShowVideoSearchButtons: (newValue) =>
    set((store) => ({ ...store, showVideoSearchButtons: newValue })),
}));

export default memo(function VideoSearch() {
  const store = useVideoSearchStore();
  const {
    videoSearchModalOpen,
    setVideoSearchModalOpen,
    showVideoSearchButtons,
    setShowVideoSearchButtons,
  } = store;

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

  useEffect(() => {
    if (isFetchedAfterMount || !data) return;
    if (!(data as any)?.playerStatus?.url) {
      setShowVideoSearchButtons(true);
    } else {
      setShowVideoSearchButtons(false);
    }
  }, [isFetchedAfterMount]);

  return (
    <>
      {videoSearchModalOpen === "youtube" && (
        <YoutubeVideoSearch
          showVideoSearch={videoSearchModalOpen === "youtube"}
          onOpenModal={() => setVideoSearchModalOpen("youtube")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {videoSearchModalOpen === "twitch" && (
        <TwitchVideoSearch
          showVideoSearch={videoSearchModalOpen === "twitch"}
          onOpenModal={() => setVideoSearchModalOpen("twitch")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {videoSearchModalOpen === "facebook" && (
        <FacebookVideoSearch
          showVideoSearch={videoSearchModalOpen === "facebook"}
          onOpenModal={() => setVideoSearchModalOpen("facebook")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {videoSearchModalOpen === "vimeo" && (
        <VimeoVideoSearch
          showVideoSearch={videoSearchModalOpen === "vimeo"}
          onOpenModal={() => setVideoSearchModalOpen("vimeo")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {videoSearchModalOpen === "mixcloud" && (
        <MixcloudAudioSearch
          showVideoSearch={videoSearchModalOpen === "mixcloud"}
          onOpenModal={() => setVideoSearchModalOpen("mixcloud")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {videoSearchModalOpen === "soundcloud" && (
        <SoundCloudAudioSearch
          showVideoSearch={videoSearchModalOpen === "soundcloud"}
          onOpenModal={() => setVideoSearchModalOpen("soundcloud")}
          onCloseModal={() => {
            setVideoSearchModalOpen(null);
            setShowVideoSearchButtons(false);
          }}
        />
      )}

      {showVideoSearchButtons && !videoSearchModalOpen ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full h-full text-sm duration-100 md:text-md bg-base-100/90">
          <button
            className="fixed md:absolute btn btn-ghost btn-sm top-2 right-2 btn-circle"
            onClick={() => {
              setVideoSearchModalOpen(null);
              setShowVideoSearchButtons(false);
            }}
          >
            <AiFillCloseCircle className="w-6 h-auto" />
          </button>
          <h3>Welcome to {data?.name}&apos;s room!</h3>
          <p className="text-xs md:text-sm">
            Select a video to watch with your friends!
          </p>
          <div className="flex gap-4">
            <YoutubeVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("youtube")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />

            <TwitchVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("twitch")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />

            <FacebookVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("facebook")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />

            <VimeoVideoSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("vimeo")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />

            <MixcloudAudioSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("mixcloud")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />

            <SoundCloudAudioSearchButton
              showVideoSearch={!!videoSearchModalOpen}
              forceShow
              onOpenModal={() => setVideoSearchModalOpen("soundcloud")}
              onCloseModal={() => {
                setVideoSearchModalOpen(null);
                setShowVideoSearchButtons(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
});
