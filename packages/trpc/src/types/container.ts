export const SERVICES_TYPES = {
  Rooms: Symbol("RoomsService"),
  Chats: Symbol("ChatsService"),
  Player: Symbol("PlayerService"),
  FavoritedRooms: Symbol("FavoritedRoomsService"),
  Models: Symbol("ModelsService"),
  Queue: Symbol("QueueService"),
  Users: Symbol("UsersService"),
  Youtube: Symbol("YoutubeService"),
  Emitter: Symbol("EmitterService"),
  Discord: Symbol("DiscordService"),
};

export const EMITTER_TYPES = {
  Chats: Symbol("ChatsEmitter"),
  Player: Symbol("PlayerEmitter"),
  Rooms: Symbol("RoomsEmitter"),
  VideoChat: Symbol("VideoChatEmitter"),
  TemporaryChats: Symbol("TemporaryChatsEmitter"),
};

export const CONTROLLER_TYPES = {
  Rooms: Symbol("RoomsController"),
  Chats: Symbol("ChatsController"),
  Player: Symbol("PlayerController"),
  FavoritedRooms: Symbol("FavoritedRoomsController"),
  Users: Symbol("UsersController"),
  Youtube: Symbol("YoutubeController"),
  VideoChat: Symbol("VideoChatController"),
  TemporaryChats: Symbol("TemporaryChatsController"),
};

export const ROUTER_TYPES = {
  Rooms: Symbol("RoomsRouter"),
  Chats: Symbol("ChatsRouter"),
  Player: Symbol("PlayerRouter"),
  FavoritedRooms: Symbol("FavoritedRoomsRouter"),
  Users: Symbol("UsersRouter"),
  Youtube: Symbol("YoutubeRouter"),
  VideoChat: Symbol("VideoChatRouter"),
  TemporaryChats: Symbol("TemporaryChatsRouter"),
};

export const TRPC_ROUTES = Symbol("TRPCRoutes");
export const TRPC_ROUTER = Symbol("TRPCRouter");
