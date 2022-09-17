import { BsPlayCircleFill } from "react-icons/bs";
import { FaStar, FaYoutube } from "react-icons/fa";
import { trpc } from "@web/api";
import { useRouter } from "next/router";
import { useRef } from "react";
import Link from "next/link";
import { useMe } from "@web/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { mutate: createRoom } = trpc.useMutation(["rooms.create"], {
    onSuccess(data) {
      router.push("/rooms/[room]", `/rooms/${data.roomIdentificationId}`);
    },
  });

  const { refetchQueries } = trpc.useContext();

  const { mutateAsync: toggleFavorite } = trpc.useMutation([
    "favorited-rooms.toggle",
  ]);
  const { user } = useMe();

  const createRoomInputRef = useRef<HTMLInputElement>(null);
  const joinRoomInputRef = useRef<HTMLInputElement>(null);

  const { refetch } = trpc.useQuery(
    ["rooms.findByRoomIdentificationId", joinRoomInputRef.current?.value!],
    {
      enabled: !!joinRoomInputRef.current?.value,
      onSuccess(data) {
        if (!data) return;
        router.push("/rooms/[room]", `/rooms/${data.roomIdentificationId}`);
      },
    }
  );

  async function handleToggleFavorite(id: string) {
    await toggleFavorite({ roomId: id });
    refetchQueries(["favorited-rooms.findMyFavorites"]);
  }

  function onCreateRoom() {
    if (!createRoomInputRef.current?.value) return;
    createRoom({ name: createRoomInputRef.current.value });
  }

  function onJoinRoom() {
    if (!joinRoomInputRef.current?.value) return;
    refetch();
  }

  const { data: favoritedRooms } = trpc.useQuery(
    ["favorited-rooms.findMyFavorites"],
    {
      enabled: !!user,
    }
  );
  return (
    <div className="block w-full h-screen overflow-y-auto prose max-w-none">
      <div className="hidden md:grid hero bg-base-100">
        <div className="text-center hero-content">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold md:text-5xl">
              <BsPlayCircleFill className="inline mr-4" />
              rooms2watch
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center w-[100vw] gap-4 mt-10 md:mt-[150px] md:flex-row items-center">
        <div className="card w-full md:w-[min(400px,100%)] min-h-[200px] shadow-lg bg-base-100 m-4">
          <div className="flex flex-col card-body">
            <h1 className="card-title">
              <BsPlayCircleFill className="inline mr-2" />
              Create a room
            </h1>
            <div className="flex flex-col justify-center flex-1 gap-3">
              <h3>
                Create a room and watch <FaYoutube className="inline mb-1" />{" "}
                together with your friends!
              </h3>
              <div className="flex flex-col">
                <input
                  ref={createRoomInputRef}
                  type="text"
                  placeholder="Enter your room name"
                  className="input input-bordered input-primary"
                />
              </div>
              <button className="btn btn-primary" onClick={onCreateRoom}>
                Create a room
              </button>
            </div>
          </div>
        </div>

        <div className="divider md:divider-horizontal">OR</div>

        <div className="card w-full md:w-[min(400px,100%)] min-h-[200px] shadow-lg bg-base-100 m-4">
          <div className="flex flex-col card-body">
            <h1 className="card-title">Join an existing room</h1>
            <div className="flex flex-col justify-center flex-1 gap-3">
              <h3>Join an existing room by entering the room ID below!</h3>
              <input
                ref={joinRoomInputRef}
                type="text"
                placeholder="Enter room ID"
                className="w-full input input-bordered input-primary"
              />
              <button className="btn btn-secondary" onClick={onJoinRoom}>
                Join room
              </button>
            </div>
          </div>
        </div>
      </div>

      {!!favoritedRooms?.length && (
        <>
          <div className="flex flex-col gap-4 max-w-[min(600px,100vw)] mx-auto p-4 mb-10">
            <h2>Your Favorite Rooms</h2>
            {favoritedRooms.map((favoritedRoom) => (
              <div key={favoritedRoom.id} className="flex gap-4">
                <div className="w-[100px]">
                  {favoritedRoom.thumbnailUrl ? (
                    <img
                      src={favoritedRoom.thumbnailUrl}
                      className="object-cover w-20 h-20"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-secondary" />
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="space-x-2">
                    <Link
                      href={`/rooms/${favoritedRoom.roomIdentificationId}`}
                      passHref
                    >
                      <a className="inline text-xl no-underline link link-secondary">
                        {favoritedRoom.name}
                      </a>
                    </Link>
                    <span className="inline rounded-full badge badge-success badge-sm">
                      {favoritedRoom.videoPlatform}
                    </span>
                    <span className="tooltip" data-tip="Remove to Favorites">
                      <button
                        className="btn btn-sm btn-ghost btn-circle"
                        onClick={() => handleToggleFavorite(favoritedRoom.id)}
                      >
                        <FaStar className="text-amber-500" />
                      </button>
                    </span>
                  </div>
                  <p className="!m-0">{favoritedRoom.online} online users</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
