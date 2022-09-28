import type { Chat } from "@RoomParty/prisma-client";
import create from "zustand";

export interface RoomsStore {
  chats?: Chat[];
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
  addChat: (chat: Chat) => void;
  chatsLength: () => number;
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  chats: [],
  collapsed: true,

  isPlayed: true,
  scrubTime: 0,
  tabSessionId: Math.floor((Math.random() * 1_000_000) % 1_000_0),

  chatsLength: () => get().chats?.length ?? 0,
  addChat: (chat) =>
    set((state) => ({
      ...state,
      chats: state.chats ? [...state.chats, chat] : [chat],
    })),
  set: (newState) => set((state) => ({ ...state, ...newState })),
}));
