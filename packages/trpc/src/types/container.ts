export const SERVICES_TYPES = {
    Rooms: Symbol("RoomsService"),
    Chats: Symbol("ChatsService"),
    Player: Symbol("PlayerService"),
    FavoritedRooms: Symbol("FavoritedRoomsService"),
    Models: Symbol("ModelsService"),
    Queue: Symbol("QueueService"),
    Users: Symbol("UsersService"),
    Youtube: Symbol("YoutubeService"),
};

export const CONTROLLER_TYPES = {
    Rooms: Symbol("RoomsController"),
    Chats: Symbol("ChatsController"),
    Player: Symbol("PlayerController"),
    FavoritedRooms: Symbol("FavoritedRoomsController"),
    Users: Symbol("UsersController"),
    Youtube: Symbol("YoutubeController"),
};

export const ROUTES_TYPES = {
    Rooms: Symbol("RoomsRoutes"),
    Chats: Symbol("ChatsRoutes"),
    Player: Symbol("PlayerRoutes"),
    FavoritedRooms: Symbol("FavoritedRoomsRoutes"),
    Users: Symbol("UsersRoutes"),
    Youtube: Symbol("YoutubeRoutes"),
};

export const TRPC_ROUTES = Symbol("TRPCRoutes");
export const TRPC_ROUTER = Symbol("TRPCRouter");
