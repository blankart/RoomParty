import { PlayerStatus } from "@rooms2watch/trpc";
import { trpc } from "@web/api";
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
  } = useReactPlayerContext();

  const { thumbnail } = useRoomsStore(
    (s) => ({ thumbnail: s.thumbnail }),
    shallow
  );

  const { user } = useMe();

  const { password, userName } = useRoomContext();

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

    const newPlayerStatus = findByRoomIdentificationIdResponse.playerStatus as
      | PlayerStatus
      | undefined;
    const newScrubTime = newPlayerStatus?.time ?? 0;
    const shouldPlayTheVideo = newPlayerStatus?.type === "PLAYED";
    setUrl(newPlayerStatus?.url);
    seekTo(newScrubTime, "seconds", !shouldPlayTheVideo);
    findMyRoomAlreadyFetchAfterMount.current = true;
  }, [isFetchedAfterMount, findByRoomIdentificationIdResponse]);

  const { mutateAsync: control } = trpc.useMutation(["player.control"]);

  const isControlsDisabled = !!findByRoomIdentificationIdResponse
    ? user && user.user.id === findByRoomIdentificationIdResponse?.owner?.userId
      ? false
      : findByRoomIdentificationIdResponse?.videoControlRights === "OwnerOnly"
    : false;

  async function onPlay() {
    if (isControlsDisabled) return;
    await control({
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
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
    if (isControlsDisabled) return;
    await control({
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
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
  ]);

  async function onSeek(time: number) {
    if (isControlsDisabled) return;
    await control({
      id: findByRoomIdentificationIdResponse?.id!,
      statusObject: {
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

  function onNext(newPlayerStatus: PlayerStatus) {
    setLastPlayerStatus(newPlayerStatus);
    if (newPlayerStatus.type === "PLAYED") {
      playVideo();
      return;
    }

    if (newPlayerStatus.type === "PAUSED") {
      pauseVideo();
      return;
    }

    if (newPlayerStatus.type === "SEEK_TO") {
      seekTo(newPlayerStatus.time);
      return;
    }

    if (newPlayerStatus.type === "CHANGE_URL") {
      seekTo(0);
      setUrl(newPlayerStatus.url);
      return;
    }
  }

  useEffect(() => {
    if (
      !isReady ||
      !isFetchedAfterMount ||
      !findMyRoomAlreadyFetchAfterMount.current ||
      !findByRoomIdentificationIdResponse
    )
      return;

    setTimeout(() => {
      onReady();
    }, 1_000);
  }, [isReady, isFetchedAfterMount, findByRoomIdentificationIdResponse]);

  function onReady() {
    scrubTime && seekTo(scrubTime, "seconds", !isPlayed);
  }

  const [lastPlayerStatus, setLastPlayerStatus] = useState<null | PlayerStatus>(
    null
  );

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
    },
    player: {
      controls: false,
      pip: false,
      width: "100%",
      height: "100%",
      style: isControlsDisabled ? { pointerEvents: "none" } : undefined,
      onPlay: isControlsDisabled ? undefined : reactPlayerProps.onPlay,
    },
    roomInfo: findByRoomIdentificationIdResponse,
  };
}
