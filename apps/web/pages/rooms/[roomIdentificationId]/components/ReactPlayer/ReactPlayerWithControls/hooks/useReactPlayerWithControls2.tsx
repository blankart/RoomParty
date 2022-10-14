import type { PlayerStatus } from "@RoomParty/trpc";
import { trpc } from "@web/trpc";
import { InferQueryOutput } from "@web/types/trpc";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactPlayerProps } from "react-player";
import { useReactPlayerContext } from "../../context/ReactPlayerContext";
import { ReactPlayerControlBarProps } from "../components/ReactPlayerControlBar";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import shallow from "zustand/shallow";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";
import { useMe } from "@web/context/AuthContext";
import { useToast } from "@web/pages/components/Toast";

export default function useReactPlayerWithControls2(): {
  control: ReactPlayerControlBarProps;
  player: ReactPlayerProps;
  roomInfo: InferQueryOutput<"rooms.findByRoomIdentificationId"> | undefined;
} {
  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;

  const {
    seekTo,
    playVideo,
    pauseVideo,
    duration,
    setUrl,
    url,
    isBuffering,
    hasEnded,
    isPlayed,
    scrubTime,
    isReady,
    isLive,
    volume,
    setVolume,
    isMuted,
    setMuted,
    hasInitiallyPlayed,
    reactPlayerProps,
    hasError,
    setVideoPlatform,
    videoPlatform,
    toggleFullScreen,
    getInternalPlayer,
  } = useReactPlayerContext();

  const { thumbnail } = useRoomsStore(
    (s) => ({ thumbnail: s.thumbnail }),
    shallow
  );

  const { user } = useMe();

  const { password, userName, roomTransientId } = useRoomContext();

  const { data: findByRoomIdentificationIdResponse, isFetchedAfterMount } =
    trpc.useQuery(
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

  const findMyRoomAlreadyFetchAfterMount = useRef<boolean>(false);

  useEffect(() => {
    if (!isFetchedAfterMount || findMyRoomAlreadyFetchAfterMount.current)
      return;
    if (!findByRoomIdentificationIdResponse) {
      findMyRoomAlreadyFetchAfterMount.current = true;
      return;
    }

    (async function () {
      const newPlayerStatus =
        findByRoomIdentificationIdResponse.playerStatus as
          | PlayerStatus
          | undefined;
      const newScrubTime = newPlayerStatus?.time ?? 0;
      const shouldPlayTheVideo = newPlayerStatus?.type === "PLAYED";
      setUrl(newPlayerStatus?.url);
      setVideoPlatform(
        findByRoomIdentificationIdResponse?.videoPlatform ??
          newPlayerStatus?.videoPlatform
      );
      await seekTo(newScrubTime, "seconds", !shouldPlayTheVideo);
      findMyRoomAlreadyFetchAfterMount.current = true;
    })();
  }, [isFetchedAfterMount, findByRoomIdentificationIdResponse]);

  const { mutateAsync: control } = trpc.useMutation(["player.control"]);

  const isControlsDisabled = !!findByRoomIdentificationIdResponse
    ? user && user.user.id === findByRoomIdentificationIdResponse?.owner?.userId
      ? false
      : findByRoomIdentificationIdResponse?.videoControlRights === "OwnerOnly"
    : false;

  async function onPlay() {
    if (isControlsDisabled || hasError) return;
    await control({
      roomTransientId: roomTransientId!,
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
        videoPlatform: videoPlatform!,
        name: userName,
        type: "PLAYED",
        time: scrubTime,
        url: url!,
        thumbnail,
        tabSessionId: 123,
      },
    });
  }

  async function onPause() {
    if (isControlsDisabled || hasError) return;
    await control({
      roomTransientId: roomTransientId!,
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
        videoPlatform: videoPlatform!,
        name: userName,
        type: "PAUSED",
        time: scrubTime,
        url: url ?? "",
        thumbnail,
        tabSessionId: 123,
      },
    });
  }

  const debouncedOnSeek = useCallback(debounce(onSeek, 300), [
    isControlsDisabled,
    findByRoomIdentificationIdResponse?.id,
    hasError,
    url,
    thumbnail,
    videoPlatform,
  ]);

  async function onSeek(time: number) {
    if (isControlsDisabled || hasError) return;
    await control({
      roomTransientId: roomTransientId!,
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
        videoPlatform: videoPlatform!,
        name: userName,
        type: "SEEK_TO",
        time,
        url: url ?? "",
        thumbnail,
        tabSessionId: 123,
      },
    });
  }

  trpc.useSubscription(
    [
      "player.statusSubscription",
      {
        id: findByRoomIdentificationIdResponse?.id!,
        name: userName!,
      },
    ],
    {
      enabled: !!findByRoomIdentificationIdResponse?.id,
      onNext,
    }
  );

  const context = trpc.useContext();

  const [lastPlayerStatus, setLastPlayerStatus] = useState<null | PlayerStatus>(
    null
  );

  async function whenPlayerStatusChanged(newPlayerStatus: PlayerStatus) {
    if (newPlayerStatus.type === "PLAYED") {
      await playVideo();
      return;
    }

    if (newPlayerStatus.type === "PAUSED") {
      await pauseVideo();
      return;
    }

    if (newPlayerStatus.type === "SEEK_TO") {
      await seekTo(newPlayerStatus.time);
      return;
    }

    if (newPlayerStatus.type === "CHANGE_URL") {
      context.invalidateQueries(["rooms.findByRoomIdentificationId"]);
      setUrl(newPlayerStatus.url);
      setVideoPlatform(newPlayerStatus.videoPlatform);
      await seekTo(newPlayerStatus.time, "seconds", false);
      return;
    }
  }

  useEffect(() => {
    if (!lastPlayerStatus) return;
    whenPlayerStatusChanged(lastPlayerStatus);
  }, [lastPlayerStatus]);

  function onNext(newPlayerStatus: PlayerStatus) {
    setLastPlayerStatus(newPlayerStatus);
  }

  useEffect(() => {
    if (
      !isReady ||
      !isFetchedAfterMount ||
      !findMyRoomAlreadyFetchAfterMount.current ||
      !findByRoomIdentificationIdResponse
    )
      return;

    setTimeout(async () => {
      onReady();
    }, 1_000);
  }, [isReady, isFetchedAfterMount, findByRoomIdentificationIdResponse]);

  async function onReady() {
    scrubTime && (await seekTo(scrubTime, "seconds", !isPlayed));
  }

  const { add } = useToast();

  useEffect(() => {
    if (
      !isReady ||
      !isFetchedAfterMount ||
      !findMyRoomAlreadyFetchAfterMount.current ||
      !findByRoomIdentificationIdResponse
    )
      return;

    const interval = setInterval(() => {
      const internalPlayerIsPlayed = (reactPlayerProps as any).reactPlayerRef
        .current?.player?.isPlaying;

      if (isLive) {
        !internalPlayerIsPlayed && playVideo();
        return;
      }

      if (isPlayed) {
        !internalPlayerIsPlayed && playVideo();
      } else {
        internalPlayerIsPlayed && pauseVideo();
      }
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, [
    isLive,
    isPlayed,
    reactPlayerProps,
    isReady,
    isFetchedAfterMount,
    findMyRoomAlreadyFetchAfterMount,
    findByRoomIdentificationIdResponse,
  ]);

  return {
    control: {
      isMuted,
      setMuted,
      volume,
      setVolume,
      isLive,
      isPlayed,
      onPlay,
      onPause,
      duration,
      scrubTime,
      onSeek: debouncedOnSeek,
      url: url ?? "",
      isBuffering,
      hasEnded,
      hasInitiallyPlayed,
      isControlsDisabled,
      lastPlayerStatus,
      toggleFullScreen,
    },
    player: {
      controls: false,
      pip: false,
      width: "100%",
      height: "100%",
      async onPlay() {
        !isControlsDisabled && (await reactPlayerProps.onPlay?.());
        if (!isPlayed) {
          pauseVideo();
          if (!isControlsDisabled) {
            if (!isLive) {
              add(
                "Use the bottom control bar to synchronize controls.",
                "error",
                "control-bar-warning"
              );
            } else {
              add(
                "Pause is disabled for live streams",
                "error",
                "control-bar-warning"
              );
            }
          }
        }
      },
      onPause() {
        if (isPlayed) {
          playVideo();
          if (!isControlsDisabled) {
            if (!isLive) {
              add(
                "Use the bottom control bar to synchronize controls.",
                "error",
                "control-bar-warning"
              );
            } else {
              add(
                "Pause is disabled for live streams",
                "error",
                "control-bar-warning"
              );
            }
          }
        }
      },
    },
    roomInfo: findByRoomIdentificationIdResponse,
  };
}
