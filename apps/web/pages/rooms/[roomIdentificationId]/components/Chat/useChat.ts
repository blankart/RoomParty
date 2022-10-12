import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import uniqBy from "lodash.uniqby";
import randomColor from "randomcolor";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { CHAT_NAME_KEY } from "@RoomParty/shared-lib";

import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import { trpc } from "@web/trpc";
import { useMe } from "@web/context/AuthContext";
import useLocalStorage from "@web/hooks/useLocalStorage";

import { ChatProps } from "./Chat";
import { ChatTextareaForm } from "./ChatTextarea";
import { useRoomContext } from "../../context/RoomContext";
import { useToast } from "@web/pages/components/Toast";

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
      // chats: s.chats,
      // addChat: s.addChat,
      // chatsLength: s.chatsLength,
      temporaryChats: s.temporaryChats,
      temporaryChatsLength: s.temporaryChatsLength,
      addTemporaryChat: s.addTemporaryChat,
      name: s.name,
    }),
    shallow
  );

  const { localStorageSessionId, roomTransientId, password, userName } =
    useRoomContext();

  const { user, isLoading } = useMe();
  const shouldEnableQueries =
    !!roomStore.id && !!userName && !!localStorageSessionId;

  const [chatsRef] = useAutoAnimate<HTMLDivElement>({ duration: 100, easing: 'ease-in' });

  const [
    userNameChatColorFromLocalStorage,
    setUserNameChatColorFromLocalStorage,
  ] = useLocalStorage<string>(getLocalStorageColorName(roomStore?.id ?? ""));

  useEffect(() => {
    !userNameChatColorFromLocalStorage &&
      setUserNameChatColorFromLocalStorage(randomColor());
  }, []);

  const { isFetching, data } = trpc.useQuery(
    ["chats.chats", { id: roomStore.id! }],
    {
      enabled: !!roomStore.id,
    }
  );

  trpc.useSubscription(
    [
      "temporary-chats.chatSubscription",
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
        roomStore.set({
          temporaryChats: [...useRoomsStore.getState().temporaryChats, data],
        });
        removeUnusedLocalStorageItems();
      },
    }
  );

  // const chatsFetchedOnceRef = useRef<boolean>(false);

  // useEffect(() => {
  //   if (chatsFetchedOnceRef.current || !data || !roomStore.chats) return;
  //   roomStore.set({
  //     chats: uniqBy([...data, ...roomStore.chats], (c) => c.id),
  //   });
  //   chatsFetchedOnceRef.current = true;
  // }, [data, roomStore.chats]);

  // trpc.useSubscription(
  //   [
  //     "chats.chatSubscription",
  //     {
  //       id: roomStore.id!,
  //       name: userName,
  //       localStorageSessionId: localStorageSessionId!,
  //       roomTransientId: roomTransientId!,
  //       password: password ?? "",
  //     },
  //   ],
  //   {
  //     enabled: shouldEnableQueries && !!roomTransientId,
  //     onNext: (data) => {
  //       roomStore.addChat(data);
  //       removeUnusedLocalStorageItems();
  //     },
  //   }
  // );

  const toast = useToast();

  // const { mutateAsync: send } = trpc.useMutation(["chats.send"], {
  //   onError(error, variables, context) {
  //     toast.add(error.message, "error", "chat-exceed-limit");
  //   },
  // });

  // useEffect(() => {
  //   scrollChatsToBottom();
  // }, [roomStore.chatsLength()]);

  const { mutateAsync: send } = trpc.useMutation(["temporary-chats.send"], {
    onError(error, variables, context) {
      toast.add(error.message, "error", "chat-exceed-limit");
    },
  });

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
    // send({
    //   name: userName,
    //   message: data.message,
    //   id: roomStore.id,
    //   userId: user?.user?.id,
    //   color,
    // });
    send({
      name: userName,
      message: data.message,
      id: roomStore.id,
      userId: user?.user?.id,
      color,
      roomTransientId: roomTransientId!,
    });
    setUserNameChatColorFromLocalStorage(color);
  }

  useEffect(() => {
    scrollChatsToBottom();
  }, [roomStore.temporaryChatsLength()]);

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
