import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";
import Link from "next/link";
import { FaSadTear, FaSpinner } from "react-icons/fa";

export default function Rooms() {
  const {
    user,
    isLoading: isUserLoading,
    hasAccessToken,
    hasUserInitialized,
  } = useMe();

  const {
    data: myRooms,
    isLoading,
    isStale,
  } = trpc.useQuery(["rooms.findMyRoom"], {
    enabled: !!user,
  });

  const shouldShowLoadingIndicator =
    !hasUserInitialized ||
    (hasAccessToken && isUserLoading) ||
    (!user && !isStale) ||
    isLoading;

  return (
    <div className="w-full h-screen overflow-y-auto prose max-w-none !block">
      <h1 className="mt-10 text-center">My Rooms</h1>
      {shouldShowLoadingIndicator ? (
        <div className="flex flex-wrap gap-4 p-4 max-w-[min(1300px,100vw)] justify-center mx-auto h-[400px]">
          <FaSpinner className="w-12 h-auto animate-spin" />
        </div>
      ) : (
        <>
          {!!myRooms?.length ? (
            <div className="flex flex-wrap gap-4 p-4 max-w-[min(1300px,100vw)] justify-center mx-auto">
              {myRooms.map((room) => (
                <div
                  className="overflow-hidden no-underline duration-100 rounded-none card w-96 bg-base-100 hover:shadow-primary hover:shadow-lg basis-[400px]"
                  key={room.id}
                >
                  <figure className="!m-0">
                    {!!room.thumbnail && (
                      <img
                        src={room.thumbnail}
                        className="!m-0 !p-0 w-full object-cover"
                        alt={room.name}
                      />
                    )}
                  </figure>
                  <div className="card-body">
                    <Link href={`/rooms/${room.id}`} passHref>
                      <a className="card-title !m-0">{room.name}&apos;s room</a>
                    </Link>
                    <p className="!m-0">{room.online} online users</p>

                    <div className="flex gap-4 card-actions">
                      <button className="rounded-full btn btn-xs btn-error btn-disabled">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[min(800px,80vh)] w-full flex flex-col justify-center items-center p-4">
              <FaSadTear className="w-20 h-auto" />
              <h2 className="text-lg text-center md:text-2xl">
                No rooms created yet.{" "}
                <Link href="/">
                  <a className="font-bold link link-primary">Create one?</a>
                </Link>
              </h2>
            </div>
          )}
        </>
      )}
    </div>
  );
}
