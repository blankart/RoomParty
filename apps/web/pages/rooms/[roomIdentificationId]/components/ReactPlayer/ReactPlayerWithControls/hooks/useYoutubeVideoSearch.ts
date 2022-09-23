import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import { YoutubeVideoSearchProps } from "../components/YoutubeVideoSearch";
import { trpc } from "@web/api";
import useDebouncedState from "@web/hooks/useDebouncedState";
import numeral from "numeral";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";

export function useYoutubeVideoSearch(props: YoutubeVideoSearchProps) {
  const [focused, setFocused] = useState(false);
  const youtubeInputRef = useRef<HTMLInputElement>(null);
  const [q, debouncedQ, setQ] = useDebouncedState("", 300);

  const { userName } = useRoomContext();

  const { id, tabSessionId, url } = useRoomsStore(
    (s) => ({
      id: s.id,
      tabSessionId: s.tabSessionId,
      url: s.url,
    }),
    shallow
  );

  const {
    data: searchResult,
    refetch,
    isLoading,
  } = trpc.useQuery(["youtube.search", debouncedQ], {
    select(data) {
      return (
        (data?.items ?? [])
          .map((item) => ({
            id: item.id,
            title: item.title,
            thumbnailSrc: item.thumbnails?.[0]?.url,
            description: item.description,
            uploadedAt: item.uploadedAt,
            views: numeral(item.views).format("0,0"),
            url: item.url,
          }))
          ?.filter((item) => item.title !== "Channels new to you") ?? []
      );
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutateAsync: control } = trpc.useMutation(["player.control"]);

  function onSelectLink(url: string, thumbnail: string) {
    control({
      id: id!,
      statusObject: {
        tabSessionId: tabSessionId,
        name: userName!,
        type: "CHANGE_URL",
        time: 0,
        url,
        thumbnail,
      },
    });
    props.onCloseModal();
  }

  return {
    focused,
    setFocused,
    youtubeInputRef,
    id,
    userName,
    control,
    tabSessionId,
    searchResult,
    q,
    setQ,
    refetch,
    onSelectLink,
    isLoading,
    debouncedQ,
  };
}