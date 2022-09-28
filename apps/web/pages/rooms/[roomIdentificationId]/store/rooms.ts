import type { Chat } from "@RoomParty/prisma-client";
import { TemporaryChat } from "@RoomParty/trpc";
import create from "zustand";

export interface RoomsStore {
  id?: string;
  name?: string;
  collapsed: boolean;
  tabSessionId: number;
  owner?: string;
  videoPlatform?: string;
  ownerName?: string | null;

  isPlayed: boolean;
  scrubTime: number;
  type?: string;
  thumbnail?: string;

  set: (roomStore?: Partial<RoomsStore>) => void;

  // addChat: (chat: Chat) => void;
  // chatsLength: () => number;
  // chats?: Chat[];

  addTemporaryChat: (chat: TemporaryChat) => void
  temporaryChatsLength: () => number;
  temporaryChats: TemporaryChat[];
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  collapsed: true,

  isPlayed: true,
  scrubTime: 0,
  tabSessionId: Math.floor((Math.random() * 1_000_000) % 1_000_0),

  // chats: [],
  // chatsLength: () => get().chats?.length ?? 0,
  // addChat: (chat) =>
  //   set((state) => ({
  //     ...state,
  //     chats: state.chats ? [...state.chats, chat] : [chat],
  //   })),
  temporaryChats: [],
  temporaryChatsLength: () => get().temporaryChats?.length ?? 0,
  addTemporaryChat: (chat) => set((state) => ({
    ...state,
    chats: [...state.temporaryChats, chat],
  }))
  ,
  set: (newState) => set((state) => ({ ...state, ...newState })),
}));
