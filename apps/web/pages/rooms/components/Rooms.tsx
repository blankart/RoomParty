import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSadTear, FaSpinner } from "react-icons/fa";

import { trpc } from "@web/api";
import Modal from "@web/components/Modal/Modal";
import { useMe } from "@web/context/AuthContext";

import dynamic from "next/dynamic";
const RoomItem = dynamic(() => import("./RoomItem"), { ssr: false });
const DeleteMyRoomItem = dynamic(() => import("./DeleteMyRoomItem"), {
  ssr: false,
});

export default function Rooms() {
  const {
    user,
    isLoading: isUserLoading,
    hasAccessToken,
    hasUserInitialized,
  } = useMe();

  const { refetchQueries } = trpc.useContext();

  const {
    data: myRooms,
    isLoading,
    isStale,
  } = trpc.useQuery(["rooms.findMyRoom"], {
    enabled: !!user,
  });

  const { mutateAsync: deleteMyRoom, isLoading: isDeleteMyRoomLoading } =
    trpc.useMutation(["rooms.deleteMyRoom"]);

  const shouldShowLoadingIndicator =
    !hasUserInitialized ||
    (hasAccessToken && isUserLoading) ||
    (!user && !isStale) ||
    isLoading;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return;

    return myRooms?.find((r) => r.id === selectedRoomId) ?? undefined;
  }, [selectedRoomId]);

  function handleDelete(id: string) {
    setSelectedRoomId(id);
  }

  async function deleteRoom() {
    selectedRoomId &&
      (await deleteMyRoom({ id: selectedRoomId }).then(() => {
        setSelectedRoomId(null);
        refetchQueries(["rooms.findMyRoom"]);
      }));
  }
  return (
    <>
      <div className="block w-full min-h-screen overflow-y-auto prose max-w-none">
        {!!selectedRoom && (
          <Modal
            onClose={() => {
              setSelectedRoomId(null);
            }}
            open={!!selectedRoom}
            title="Are you sure you want to delete this room?"
            containerClassName="w-[min(400px,100%)] p-10 m-4"
            closeOnClickOutside
            showCloseButton
          >
            <DeleteMyRoomItem
              {...selectedRoom}
              isDeleteMyRoomLoading={isDeleteMyRoomLoading}
              deleteRoom={deleteRoom}
            />
          </Modal>
        )}
        <h1 className="mt-10 text-2xl text-center lg:text-4xl">My Rooms</h1>
        {shouldShowLoadingIndicator ? (
          <div className="flex flex-wrap gap-4 p-4 max-w-[min(1000px,100%)] justify-center mx-auto h-[400px]">
            <FaSpinner className="w-12 h-auto animate-spin" />
          </div>
        ) : (
          <>
            {!!myRooms?.length ? (
              <div className="flex flex-wrap gap-4 p-4 max-w-[min(1000px,100%)] justify-center mx-auto">
                {myRooms.map((room) => (
                  <RoomItem
                    key={room.id}
                    {...room}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="min-h-[min(1000px,100%)] w-full flex flex-col justify-center items-center p-4">
                <FaSadTear className="w-20 h-auto" />
                <h2 className="text-lg text-center md:text-2xl">
                  No rooms created yet.{" "}
                  <Link href="/">
                    <a className="font-bold link link-secondary">Create one?</a>
                  </Link>
                </h2>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
