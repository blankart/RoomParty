import { ChatProps } from "./Chat";
import { trpc } from "@web/api";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useRoomsStore } from "@web/store/rooms";
import shallow from "zustand/shallow";
import { CHAT_LOCAL_STORAGE_SESSION_KEY, CHAT_NAME_KEY } from "@rooms2watch/common-types";
import useMe from "@web/hooks/useMe";

const getLocalStorageKeyName = (id: string) => `${CHAT_NAME_KEY}.${id}`;

export default function useChat(props: ChatProps) {
  const router = useRouter();
  const {
    collapsed,
    id,
    set,
    userName,
    addChat,
    chatsLength,
    showPrompt,
    name,
    chats,
    owner,
    localStorageSessionId,
  } = useRoomsStore(
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

  function scrollChatsToBottom() {
    chatsRef.current?.scrollTo({
      behavior: "smooth",
      top: Number.MAX_SAFE_INTEGER,
    });
  }
  useEffect(() => {
    scrollChatsToBottom();
    if (inputRef.current && !inputRef.current?.value?.trim()) {
      inputRef.current.value = "";
    }
  }, [chatsLength()]);

  const chatsRef = useRef<HTMLDivElement>(null);

  trpc.useQuery(["chats.chats", id!], {
    enabled: !!id,
    onSuccess(chats) {
      set({ chats });
    },
  });

  useEffect(() => {
    const newId = id ?? (router.query?.id as string | undefined);
    if (newId !== id) set({ id });
  }, [id, router.query?.id]);

  function setName(newName: string) {
    set({ userName: newName, showPrompt: false });
    id && localStorage.setItem(getLocalStorageKeyName(id), newName);
  }

  useEffect(() => {
    if (localStorageSessionId) return;

    const sessionId = localStorage.getItem(CHAT_LOCAL_STORAGE_SESSION_KEY);
    if (!sessionId) {
      const newLocalStorageSessionId = Math.floor(
        (Math.random() * 1_000_000) % 1_000_0
      );
      localStorage.setItem(
        CHAT_LOCAL_STORAGE_SESSION_KEY,
        String(newLocalStorageSessionId)
      );

      set({ localStorageSessionId: newLocalStorageSessionId });
      return;
    }

    set({ localStorageSessionId: Number(sessionId) });
  }, []);

  useEffect(() => {
    if (userName) return;
    if (!id) return;
    const storedName =
      (id && localStorage.getItem(getLocalStorageKeyName(id))) ?? "";
    if (!storedName) {
      set({ showPrompt: true });
      return;
    } else {
      set({ userName: storedName });
    }

    if (!id) return;
    for (const key in localStorage) {
      const maybeMatchedId = key?.match(
        new RegExp(`${CHAT_NAME_KEY}\\.(.*)$`)
      )?.[1];
      if (key.startsWith(CHAT_NAME_KEY) && maybeMatchedId !== id) {
        localStorage.removeItem(key);
      }
    }
  }, [id]);

  const { user } = useMe()

  const shouldEnableQueries = !!id && !!userName && !!localStorageSessionId;
  trpc.useSubscription(
    [
      "chats.chatSubscription",
      {
        id: id!,
        name: userName,
        localStorageSessionId: localStorageSessionId!,
      },
    ],
    {
      enabled: shouldEnableQueries,
      onNext: (data) => {
        addChat(data);
      },
    }
  );

  const { mutate: send } = trpc.useMutation(["chats.send"]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function onSend() {
    if (!inputRef.current?.value?.trim() || !id) return;
    send({ name: userName, message: inputRef.current.value, id, userId: user?.user?.id });
    inputRef.current.value = "";
    inputRef.current.focus();
  }

  function onSetName() {
    if (!nameInputRef.current?.value) return;
    setName(nameInputRef.current?.value);
  }

  return {
    chatsRef,
    onSetName,
    nameInputRef,
    inputRef,
    onSend,
    shouldEnableQueries,
    chats,
    collapsed,
    showPrompt,
    set,
    name,
    owner,
  };
}
