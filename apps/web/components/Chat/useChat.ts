import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";

import {
  CHAT_LOCAL_STORAGE_SESSION_KEY,
  CHAT_NAME_KEY,
} from "@rooms2watch/common-types";

import { useRoomsStore } from "@web/store/rooms";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import useLocalStorage from "@web/hooks/useLocalStorage";

import { ChatProps } from "./Chat";
import randomColor from "randomcolor";

const getLocalStorageKeyName = (id: string) => `${CHAT_NAME_KEY}.${id}`;
const getLocalStorageColorName = (id: string) => `${getLocalStorageKeyName(id)}.chat-color`;

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [showShareWithYourFriendsModal, setShowShareWithYourFriendsModal] =
    useState(false);
  const [sessionId, setSessionId] = useLocalStorage<undefined | number>(
    CHAT_LOCAL_STORAGE_SESSION_KEY
  );
  const [userNameFromLocalStorage, setUserNameFromLocalStorage] =
    useLocalStorage<string | undefined>(
      getLocalStorageKeyName(roomStore?.id ?? "")
    );
  const [userNameChatColorFromLocalStorage, setUserNameChatColorFromLocalStorage] = useLocalStorage<string>(getLocalStorageColorName(roomStore?.id ?? ''))

  useEffect(() => {
    !userNameChatColorFromLocalStorage && setUserNameChatColorFromLocalStorage(randomColor())
  }, [])

  const { isFetching } = trpc.useQuery(["chats.chats", roomStore.id!], {
    enabled: !!roomStore.id,
    onSuccess(chats) {
      roomStore.set({ chats });
    },
  });

  trpc.useSubscription(
    [
      "chats.chatSubscription",
      {
        id: roomStore.id!,
        name: roomStore.userName,
        localStorageSessionId: roomStore.localStorageSessionId!,
      },
    ],
    {
      enabled: shouldEnableQueries,
      onNext: (data) => {
        roomStore.addChat(data);
      },
    }
  );

  const { mutateAsync: send } = trpc.useMutation(["chats.send"]);
  const trpcContext = trpc.useContext();
  const { mutateAsync: toggle } = trpc.useMutation(["favorited-rooms.toggle"]);
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

  function onSend() {
    if (!inputRef.current?.value?.trim() || !roomStore.id) return;
    let color = userNameChatColorFromLocalStorage
    if (!color) color = randomColor()
    send({
      name: roomStore.userName,
      message: inputRef.current.value,
      id: roomStore.id,
      userId: user?.user?.id,
      color,
    });
    setUserNameChatColorFromLocalStorage(color)
    inputRef.current.value = "";
    inputRef.current.focus();
  }

  function onSetName() {
    if (!nameInputRef.current?.value) return;
    setName(nameInputRef.current?.value);
    setShowShareWithYourFriendsModal(true);
  }

  async function onToggleFavorites() {
    !!roomStore.id && (await toggle({ roomId: roomStore.id }));
    trpcContext.invalidateQueries([
      "favorited-rooms.isRoomFavorited",
      { roomId: roomStore.id! },
    ]);
  }

  function onClickShareWithYourFriends() {
    setShowShareWithYourFriendsModal(!showShareWithYourFriendsModal);
  }

  useEffect(() => {
    scrollChatsToBottom();
    if (inputRef.current && !inputRef.current?.value?.trim()) {
      inputRef.current.value = "";
    }
  }, [roomStore.chatsLength()]);

  useEffect(() => {
    const newId = roomStore.id ?? (router.query?.id as string | undefined);
    if (newId !== roomStore.id) roomStore.set({ id: roomStore.id });
  }, [roomStore.id, router.query?.id]);

  useEffect(() => {
    if (!roomStore.id) return
    if (sessionId) {
      roomStore.set({ localStorageSessionId: sessionId });
      return;
    }
    const newLocalStorageSessionId = Math.floor(
      (Math.random() * 1_000_000_000) % 1_000_000_000
    );

    setSessionId(newLocalStorageSessionId);
    roomStore.set({ localStorageSessionId: newLocalStorageSessionId });
    removeUnusedLocalStorageItems()
  }, []);

  function removeUnusedLocalStorageItems() {
    if (!roomStore.id) return
    for (const key in localStorage) {
      const maybeMatchedId = key?.match(
        new RegExp(`${CHAT_NAME_KEY}\\.(.*)$`)
      )?.[1];
      if (key.startsWith(CHAT_NAME_KEY) && !maybeMatchedId?.startsWith(roomStore.id)) {
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

  const showFavoriteButton =
    !!roomStore.id &&
    !!user &&
    !!roomStore.owner &&
    user.user.id !== roomStore.owner;

  return {
    ...roomStore,
    chatsRef,
    onSetName,
    nameInputRef,
    inputRef,
    onSend,
    shouldEnableQueries,
    user,
    showFavoriteButton,
    onToggleFavorites,
    isRoomFavorited,
    isLoading,
    isFetching,
    router,
    onClickShareWithYourFriends,
    showShareWithYourFriendsModal,
  };
}
