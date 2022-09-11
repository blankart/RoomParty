import { PlayerStatus } from 'trpc';
import { Chat } from 'prisma-client'
import create from 'zustand'

export interface RoomsStore {
    chats?: Chat[]
    id?: string;
    name?: string
    playerStatus?: PlayerStatus | null
    userName: string
    collapsed: boolean,
    showPrompt: boolean
    sessionId: number,

    isPlayed: boolean,
    scrubTime: number,
    url?: string,

    set: (roomStore?: Partial<RoomsStore>) => void
    addChat: (chat: Chat) => void,
    chatsLength: () => number,
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
    chats: [],
    collapsed: true,
    showPrompt: false,
    userName: '',

    isPlayed: true,
    scrubTime: 0,
    sessionId: Math.floor((Math.random() * 1_000_000) % 1_000_0),

    chatsLength: () => get().chats?.length ?? 0,
    addChat: (chat) => set(state => ({ ...state, chats: state.chats ? [...state.chats, chat] : [chat] })),
    set: (newState) => set(state => ({ ...state, ...newState })),
}))