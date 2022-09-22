import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import uniqBy from "lodash.uniqby";

import {
  CHAT_LOCAL_STORAGE_SESSION_KEY,
  CHAT_NAME_KEY,
} from "@rooms2watch/shared-lib";

import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import useLocalStorage from "@web/hooks/useLocalStorage";

import { ChatProps } from "./Chat";
import randomColor from "randomcolor";
import { ChatNamePromptForm } from "./ChatNamePrompt";
import { ChatTextareaForm } from "./ChatTextarea";
import { useRoomContext } from "../../context/RoomContext";

const getLocalStorageKeyName = (id: string) => `${CHAT_NAME_KEY}.${id}`;
const getLocalStorageColorName = (id: string) =>
  `${getLocalStorageKeyName(id)}.chat-color`;

export default function useChat(props: ChatProps) {
  const router = useRouter();
  const roomStore = useRoomsStore(
    (s) => ({
      owner: s.owner,
      collapsed: s.collapsed,
      id: s.id,
      set: s.set,
      chats: s.chats,
      addChat: s.addChat,
      chatsLength: s.chatsLength,
      name: s.name,
    }),
    shallow
  );

  const { localStorageSessionId, roomTransientId, password, userName } =
    useRoomContext();

  const { user, isLoading } = useMe();
  const shouldEnableQueries =
    !!roomStore.id && !!userName && !!localStorageSessionId;

  const chatsRef = useRef<HTMLDivElement>(null);

  const [
    userNameChatColorFromLocalStorage,
    setUserNameChatColorFromLocalStorage,
  ] = useLocalStorage<string>(getLocalStorageColorName(roomStore?.id ?? ""));

  useEffect(() => {
    !userNameChatColorFromLocalStorage &&
      setUserNameChatColorFromLocalStorage(randomColor());
  }, []);

  const { isFetching, data } = trpc.useQuery(["chats.chats", roomStore.id!], {
    enabled: !!roomStore.id,
  });

  const chatsFetchedOnceRef = useRef<boolean>(false);

  useEffect(() => {
    if (chatsFetchedOnceRef.current || !data || !roomStore.chats) return;
    roomStore.set({
      chats: uniqBy([...data, ...roomStore.chats], (c) => c.id),
    });
    chatsFetchedOnceRef.current = true;
  }, [data, roomStore.chats]);

  trpc.useSubscription(
    [
      "chats.chatSubscription",
      {
        id: roomStore.id!,
        name: userName,
        localStorageSessionId: localStorageSessionId!,
        roomTransientId: roomTransientId!,
        password: password ?? "",
      },
    ],
    {
      enabled: shouldEnableQueries && !!roomTransientId,
      onNext: (data) => {
        roomStore.addChat(data);
        removeUnusedLocalStorageItems();
      },
    }
  );

  const { mutateAsync: send } = trpc.useMutation(["chats.send"]);

  function scrollChatsToBottom() {
    chatsRef.current?.scrollTo({
      behavior: "smooth",
      top: Number.MAX_SAFE_INTEGER,
    });
  }

  function onSend(data: ChatTextareaForm) {
    if (!data.message?.trim()) return;
    if (!roomStore.id) return;
    let color = userNameChatColorFromLocalStorage;
    if (!color) color = randomColor();
    send({
      name: userName,
      message: data.message,
      id: roomStore.id,
      userId: user?.user?.id,
      color,
    });
    setUserNameChatColorFromLocalStorage(color);
  }

  useEffect(() => {
    scrollChatsToBottom();
  }, [roomStore.chatsLength()]);

  useEffect(() => {
    const newId = roomStore.id ?? (router.query?.id as string | undefined);
    if (newId !== roomStore.id) roomStore.set({ id: roomStore.id });
  }, [roomStore.id, router.query?.id]);

  useEffect(() => {
    if (!roomStore.id) return;
    removeUnusedLocalStorageItems();
  }, []);

  function removeUnusedLocalStorageItems() {
    if (!roomStore.id) return;
    for (const key in localStorage) {
      const maybeMatchedId = key?.match(
        new RegExp(`${CHAT_NAME_KEY}\\.(.*)$`)
      )?.[1];
      if (
        key.startsWith(CHAT_NAME_KEY) &&
        !maybeMatchedId?.startsWith(roomStore.id) &&
        !maybeMatchedId?.startsWith(router.query.roomIdentificationId as string)
      ) {
        localStorage.removeItem(key);
      }
    }
  }

  return {
    ...roomStore,
    chatsRef,
    userName,
    onSend,
    shouldEnableQueries,
    user,
    isLoading,
    isFetching,
    router,
  };
}
