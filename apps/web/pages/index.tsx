import { BsPlayCircleFill } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa";
import { trpc } from "@web/api";
import { useRouter } from "next/router";
import { useRef } from "react";
import useMe from "@web/hooks/useMe";
import Link from "next/link";

export default function Index() {
  const router = useRouter();
  const { mutate: createRoom } = trpc.useMutation(["rooms.create"], {
    onSuccess(data) {
      router.push("/rooms/[room]", `/rooms/${data.id}`);
    },
  });

  const { user } = useMe();

  const createRoomInputRef = useRef<HTMLInputElement>(null);
  const joinRoomInputRef = useRef<HTMLInputElement>(null);

  const { refetch } = trpc.useQuery(
    ["rooms.findById", joinRoomInputRef.current?.value!],
    {
      enabled: !!joinRoomInputRef.current?.value,
      onSuccess(data) {
        router.push("/rooms/[room]", `/rooms/${data.id}`);
      },
    }
  );

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
      <div className="flex flex-col justify-center w-[100vw] gap-4 mt-10 md:mt-[150px] md:flex-row">
        <div className="card w-[min(400px,100vw)] min-h-[200px] shadow-lg bg-base-100 m-2">
          <div className="flex flex-col card-body">
            <h1 className="card-title">
              <BsPlayCircleFill className="inline mr-2" />
              Create a room
            </h1>
            <div className="flex flex-col justify-center flex-1 gap-3">
              <h3>
                Create a room and watch <FaYoutube className="inline" />{" "}
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

        <div className="card w-[min(400px,100vw)] min-h-[200px] shadow-lg bg-base-100 m-2">
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
                  <Link href={`/rooms/${favoritedRoom.id}`} passHref>
                    <a className="text-xl no-underline link link-secondary">
                      {favoritedRoom.name}&apos;s room
                    </a>
                  </Link>
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
