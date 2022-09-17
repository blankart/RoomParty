import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useRoomsStore } from "@web/store/rooms";
import { useControlMutation } from "./useYoutubePlayerWithControls";
import { YoutubePlayerSetupProps } from "./YoutubePlayerSetup";
import { trpc } from "@web/api";
import useDebouncedState from "@web/hooks/useDebouncedState";
import numeral from "numeral";

export function useYoutubePlayerSetup(props: YoutubePlayerSetupProps) {
  const [focused, setFocused] = useState(false);
  const youtubeInputRef = useRef<HTMLInputElement>(null);
  const [q, debouncedQ, setQ] = useDebouncedState("", 300);
  const [showVideoSearch, setShowVideoSearch] = useState(false);

  const { id, userName, tabSessionId, url } = useRoomsStore(
    (s) => ({
      id: s.id,
      userName: s.userName,
      tabSessionId: s.tabSessionId,
      url: s.url,
    }),
    shallow
  );

  useEffect(() => {
    if (!url) setShowVideoSearch(true);
  }, [url]);

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
  });

  const control = useControlMutation();

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
    setShowVideoSearch(false);
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
    showVideoSearch,
    setShowVideoSearch,
    isLoading,
    debouncedQ
  };
}
