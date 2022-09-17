import { trpc } from "@web/api";
import Modal from "@web/components/Modal/Modal";
import { useMe } from "@web/context/AuthContext";
import classNames from "classnames";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSadTear, FaSpinner, FaTrash } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";

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
      (await deleteMyRoom(selectedRoomId).then(() => {
        setSelectedRoomId(null);
        refetchQueries(["rooms.findMyRoom"]);
      }));
  }

  return (
    <div className="w-full h-screen overflow-y-auto prose max-w-none !block">
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
          <div className="flex justify-center card-actions">
            <div key={selectedRoom.id} className="flex w-full gap-4 mb-4">
              <div className="w-[100px]">
                {selectedRoom.thumbnail ? (
                  <img
                    src={selectedRoom.thumbnail}
                    className="object-cover w-20 h-20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-secondary" />
                )}
              </div>
              <div className="flex flex-col justify-center flex-1">
                <div className="text-xl no-underline text-secondary">
                  {selectedRoom.name}
                </div>
                <p className="!m-0">{selectedRoom.online} online users</p>
              </div>
            </div>
            <button
              className={classNames("w-full btn btn-error", {
                "btn-disabled": isDeleteMyRoomLoading,
              })}
              onClick={deleteRoom}
            >
              Delete{" "}
              {isDeleteMyRoomLoading && (
                <FaSpinner className="mx-2 animate-spin" />
              )}
            </button>
          </div>
        </Modal>
      )}
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
                  className="overflow-visible no-underline duration-100 rounded-none card w-96 bg-base-100 basis-[400px]"
                  key={room.id}
                >
                  <figure className="!m-0">
                    {room.thumbnail ? (
                      <img
                        src={room.thumbnail}
                        className="!m-0 !p-0 w-full object-cover h-[150px]"
                        alt={room.name}
                      />
                    ) : (
                      <div className="!m-0 !p-0 w-full object-cover bg-primary h-[150px]" />
                    )}
                  </figure>
                  <div className="card-body">
                    <div className="space-x-2">
                      <Link href={`/rooms/${room.id}`} passHref>
                        <a className="inline card-title !m-0">{room.name}</a>
                      </Link>
                      <span className="inline rounded-full badge badge-success badge-sm">
                        {room.videoPlatform}
                      </span>
                    </div>
                    <p className="!m-0">{room.online} online users</p>

                    <div className="flex justify-end gap-4 card-actions">
                      <div className="dropdown dropdown-left">
                        <div
                          tabIndex={0}
                          className="tooltip tooltip-primary"
                          data-tip="More Options"
                        >
                          <button className="rounded-full btn btn-sm btn-ghost">
                            <IoMdMore className="w-6 h-auto" />
                          </button>
                        </div>
                        <ul
                          tabIndex={0}
                          className="!p-0 !m-0 mt-3 list-none shadow-primary shadow-md bg-base-100 dropdown-content menu menu-compact"
                        >
                          <li className="p-0 m-0">
                            <button
                              className="p-0 px-4 m-0 btn btn-outline btn-sm"
                              onClick={() => handleDelete(room.id)}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
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
