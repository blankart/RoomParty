import { PlayerStatus } from "@rooms2watch/trpc";
import { trpc } from "@web/api";
import { InferQueryOutput } from "@web/types/trpc";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import type { ReactPlayerProps } from "react-player";
import { useReactPlayerContext } from "../../context/ReactPlayerContext";
import { ReactPlayerWithControlsSetupProps } from "../components/ReactPlayerWithControlsSetup";
import { ReactPlayerControlBarProps } from "../components/ReactPlayerControlBar";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import shallow from "zustand/shallow";

export default function useReactPlayerWithControls2(): {
  control: ReactPlayerControlBarProps;
  player: ReactPlayerProps;
  setup: ReactPlayerWithControlsSetupProps;
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
  } = useReactPlayerContext();

  const { userName, thumbnail } = useRoomsStore(
    (s) => ({ userName: s.userName, thumbnail: s.thumbnail }),
    shallow
  );

  const { data: findByRoomIdentificationIdResponse, isFetchedAfterMount } =
    trpc.useQuery(
      [
        "rooms.findByRoomIdentificationId",
        { roomIdentificationId: roomIdentificationId! },
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

  async function onPlay() {
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

  const debouncedOnSeek = useCallback(debounce(onSeek, 300), []);

  async function onSeek(time: number) {
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
        name: "Sample Name",
      },
    ],
    {
      enabled: !!findByRoomIdentificationIdResponse?.id,
      onNext,
    }
  );

  function onNext(newPlayerStatus: PlayerStatus) {
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
    console.log({ scrubTime, isPlayed });
    scrubTime && seekTo(scrubTime, "seconds", !isPlayed);
  }

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
    },
    player: {
      controls: false,
      pip: false,
      width: "100%",
      height: "100%",
    },
    setup: {},
    roomInfo: findByRoomIdentificationIdResponse,
  };
}
