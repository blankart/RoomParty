import dynamic from "next/dynamic";

import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";

const FavoritedRoomItem = dynamic(() => import("./FavoritedRoomItem"), {
  ssr: false,
});

interface FavoritedRoomProps {}

export default function FavoritedRoom(props: FavoritedRoomProps) {
  const { refetchQueries } = trpc.useContext();
  const { user } = useMe();
  const { data: favoritedRooms } = trpc.useQuery(
    ["favorited-rooms.findMyFavorites"],
    {
      enabled: !!user,
    }
  );

  const { mutateAsync: toggleFavorite } = trpc.useMutation([
    "favorited-rooms.toggle",
  ]);

  async function handleToggleFavorite(id: string) {
    await toggleFavorite({ roomId: id });
    refetchQueries(["favorited-rooms.findMyFavorites"]);
  }

  return (
    <>
      {!!favoritedRooms?.length && (
        <>
          <div className="flex flex-col gap-4 max-w-[min(600px,100vw)] mx-auto p-4 mb-10">
            <h2>Your Favorite Rooms</h2>
            {favoritedRooms.map((favoritedRoom) => (
              <FavoritedRoomItem
                key={favoritedRoom.id}
                {...favoritedRoom}
                handleToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
