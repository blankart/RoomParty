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
      userName: s.userName,
      chats: s.chats,
      addChat: s.addChat,
      chatsLength: s.chatsLength,
      showPrompt: s.showPrompt,
      name: s.name,
      localStorageSessionId: s.localStorageSessionId,
    }),
    shallow
  );
  const { user, isLoading, isIdle } = useMe();
  const shouldEnableQueries =
    !!roomStore.id && !!roomStore.userName && !!roomStore.localStorageSessionId;

  const chatsRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useLocalStorage<undefined | number>(
    CHAT_LOCAL_STORAGE_SESSION_KEY
  );
  const [userNameFromLocalStorage, setUserNameFromLocalStorage] =
    useLocalStorage<string | undefined>(
      getLocalStorageKeyName(roomStore?.id ?? "")
    );
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

  const { data: roomTransient } = trpc.useQuery(
    [
      "rooms.requestForRoomTransient",
      {
        roomIdentificationId: router.query?.roomIdentificationId! as string,
        localStorageSessionId: sessionId!,
        userName: roomStore.userName,
      },
    ],
    {
      enabled:
        !!router.query?.roomIdentificationId &&
        !!sessionId &&
        !!roomStore.userName,
    }
  );

  trpc.useSubscription(
    [
      "chats.chatSubscription",
      {
        id: roomStore.id!,
        name: roomStore.userName,
        localStorageSessionId: roomStore.localStorageSessionId!,
        roomTransientId: roomTransient?.id!,
      },
    ],
    {
      enabled: shouldEnableQueries && !!roomTransient?.id,
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

  function setName(newName: string) {
    roomStore.set({ userName: newName, showPrompt: false });
    roomStore.id && setUserNameFromLocalStorage(newName);
  }

  function onSend(data: ChatTextareaForm) {
    if (!data.message?.trim()) return;
    if (!roomStore.id) return;
    let color = userNameChatColorFromLocalStorage;
    if (!color) color = randomColor();
    send({
      name: roomStore.userName,
      message: data.message,
      id: roomStore.id,
      userId: user?.user?.id,
      color,
    });
    setUserNameChatColorFromLocalStorage(color);
  }

  function onSetName(data: ChatNamePromptForm) {
    setName(data.name);
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
    if (sessionId) {
      roomStore.set({ localStorageSessionId: sessionId });
      return;
    }
    const newLocalStorageSessionId = Math.floor(
      (Math.random() * 1_000_000_000) % 1_000_000_000
    );

    setSessionId(newLocalStorageSessionId);
    roomStore.set({ localStorageSessionId: newLocalStorageSessionId });
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
        !maybeMatchedId?.startsWith(roomStore.id)
      ) {
        localStorage.removeItem(key);
      }
    }
  }

  useEffect(() => {
    if (isLoading && isIdle) return;
    if (roomStore.userName || user) {
      roomStore.set({ showPrompt: false });
      return;
    }
    if (!roomStore.id) return;
    if (!userNameFromLocalStorage) {
      roomStore.set({ showPrompt: true });
      return;
    } else {
      roomStore.set({ userName: userNameFromLocalStorage });
    }

    if (!roomStore.id) return;
  }, [roomStore.id, roomStore.userName, isLoading, user, isIdle]);

  return {
    ...roomStore,
    chatsRef,
    onSetName,
    onSend,
    shouldEnableQueries,
    user,
    isLoading,
    isFetching,
    router,
  };
}
