import type { PlayerStatus } from "@rooms2watch/trpc";
import { trpc } from "@web/api";
import { useEffect, useRef, useState } from "react";
import { RoomsStore, useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import shallow from "zustand/shallow";

import { YoutubePlayerWithControlsProps } from "./YoutubePlayerWithControls";
import { useRouter } from "next/router";
import { useMe } from "@web/context/AuthContext";
import useLocalStorage from "@web/hooks/useLocalStorage";
import {
  CHAT_LOCAL_STORAGE_SESSION_KEY,
  LOCAL_STORAGE_LAST_VISITED_ROOM,
} from "@rooms2watch/shared-lib";

export function useControlMutation() {
  const { mutate: _control } = trpc.useMutation(["player.control"]);

  function control(
    param: Omit<Parameters<typeof _control>[0], "statusObject"> & {
      statusObject: PlayerStatus;
    }
  ) {
    const { type, scrubTime, userName, url, thumbnail } =
      useRoomsStore.getState();
    const newStatusObject = Object.assign(
      {
        type,
        time: scrubTime,
        name: userName,
        url,
        thumbnail,
      },
      param.statusObject
    );

    _control({ ...param, statusObject: newStatusObject });
  }

  return control;
}

export default function useYoutubePlayerWithControls(
  props: YoutubePlayerWithControlsProps
) {
  const youtubePlayerRef = useRef<any>(null);
  const router = useRouter();
  const { user } = useMe();
  const trpcContext = trpc.useContext();

  const roomStore = useRoomsStore(
    (s) => ({
      id: s.id,
      userName: s.userName,
      isPlayed: s.isPlayed,
      url: s.url,
      scrubTime: s.scrubTime,
      set: s.set,
      tabSessionId: s.tabSessionId,
      type: s.type,
      name: s.name,
      videoPlatform: s.videoPlatform,
      ownerName: s.ownerName,
      owner: s.owner,
    }),
    shallow
  );

  trpc.useSubscription(
    [
      "player.statusSubscription",
      { id: roomStore.id!, name: roomStore.userName! },
    ],
    {
      enabled: !!roomStore.id,
      onNext(data) {
        setWatchState({ thumbnail: data.thumbnail, url: data.url });

        if (data.type === "CHANGE_URL") {
          setWatchState({ isPlayed: false, scrubTime: 0, url: data.url });
        }

        if (data.tabSessionId === roomStore.tabSessionId) return;

        if (data.type === "PAUSED") {
          setWatchState({
            isPlayed: false,
            scrubTime: data.time,
            url: data.url,
          });
        }

        if (data.type === "PLAYED") {
          setWatchState({
            isPlayed: true,
            url: data.url,
          });
        }
      },
    }
  );

  function initializeWatchState(
    newState: Pick<RoomsStore, "scrubTime" | "isPlayed">
  ) {
    youtubePlayerRef?.current?.player?.player?.player?.seekTo(
      newState.scrubTime,
      "seconds"
    );

    if (newState.isPlayed) {
      youtubePlayerRef?.current?.player?.player?.player?.playVideo();
    } else {
      youtubePlayerRef?.current?.player?.player?.player?.pauseVideo();
    }
  }

  const [_, setLastVisitedRoom] = useLocalStorage<{
    name: string;
    id: string;
    videoPlatform: string;
  }>(LOCAL_STORAGE_LAST_VISITED_ROOM);

  useEffect(() => {
    if (
      !roomStore.name ||
      !router.query.roomIdentificationId ||
      !roomStore.videoPlatform
    )
      return;

    setLastVisitedRoom({
      name: roomStore.name,
      id: router.query.roomIdentificationId as string,
      videoPlatform: roomStore.videoPlatform,
    });
  }, [
    roomStore.name,
    router.query.roomIdentificationId,
    roomStore.videoPlatform,
  ]);

  function setWatchState(
    newState: Partial<
      Pick<RoomsStore, "scrubTime" | "isPlayed" | "url" | "type" | "thumbnail">
    >
  ) {
    if (newState.scrubTime && newState.scrubTime !== roomStore.scrubTime) {
      youtubePlayerRef?.current?.player?.player?.player?.seekTo(
        newState.scrubTime,
        "seconds"
      );
    }

    if (typeof newState.isPlayed === "boolean") {
      if (newState.isPlayed) {
        youtubePlayerRef?.current?.player?.player?.player?.playVideo();
      } else {
        youtubePlayerRef?.current?.player?.player?.player?.pauseVideo();
      }
    }

    roomStore.set({ ...newState });
  }

  function onStart() {
    initializeWatchState({
      scrubTime: roomStore.scrubTime ?? 0,
      isPlayed: roomStore.type !== "PAUSED",
    });
  }

  const control = useControlMutation();

  function onPause() {
    roomStore.url &&
      control({
        id: roomStore.id!,
        statusObject: {
          tabSessionId: roomStore.tabSessionId,
          time: youtubePlayerRef?.current?.getCurrentTime() ?? 0,
          type: "PAUSED",
          name: roomStore.userName!,
          url: roomStore.url,
        },
      });
  }

  function onPlay() {
    roomStore.url &&
      control({
        id: roomStore.id!,
        statusObject: {
          tabSessionId: roomStore.tabSessionId,
          type: "PLAYED",
          time: youtubePlayerRef?.current?.getCurrentTime() ?? 0,
          name: roomStore.userName!,
          url: roomStore.url,
        },
      });
  }

  function onSeek(time: number) {
    roomStore.url &&
      control({
        id: roomStore.id!,
        statusObject: {
          tabSessionId: roomStore.tabSessionId,
          name: roomStore.userName!,
          type: "SEEK_TO",
          time,
          url: roomStore.url,
        },
      });
  }

  const [showShareWithYourFriendsModal, setShowShareWithYourFriendsModal] =
    useState(false);
  function onClickShareWithYourFriends() {
    setShowShareWithYourFriendsModal(!showShareWithYourFriendsModal);
  }

  const { data: isRoomFavorited } = trpc.useQuery(
    [
      "favorited-rooms.isRoomFavorited",
      {
        roomId: roomStore.id!,
      },
    ],
    {
      enabled: !!user && !!roomStore.id,
    }
  );

  const { mutateAsync: toggle } = trpc.useMutation(["favorited-rooms.toggle"]);

  async function onToggleFavorites() {
    !!roomStore.id && (await toggle({ roomId: roomStore.id }));
    trpcContext.invalidateQueries([
      "favorited-rooms.isRoomFavorited",
      { roomId: roomStore.id! },
    ]);
  }

  const showFavoriteButton =
    !!roomStore.id &&
    !!user &&
    !!roomStore.owner &&
    user.user.id !== roomStore.owner;

  return {
    url: roomStore.url,
    tabSessionId: roomStore.tabSessionId,
    id: roomStore.id,
    userName: roomStore.userName,
    youtubePlayerRef,
    control,
    setWatchState,
    onStart,
    onPause,
    onPlay,
    onSeek,
    name: roomStore.name,
    videoPlatform: roomStore.videoPlatform,
    ownerName: roomStore.ownerName,
    onClickShareWithYourFriends,
    showShareWithYourFriendsModal,
    router,
    isRoomFavorited,
    onToggleFavorites,
    showFavoriteButton,
  };
}
