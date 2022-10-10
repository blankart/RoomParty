import { memo, useState } from "react";
import _debounce from "lodash.debounce";
import { InferQueryOutput } from "@web/types/trpc";
import { FiSearch, FiShare } from "react-icons/fi";
import { useMe } from "@web/context/AuthContext";
import { trpc } from "@web/api";
import { FaCopy, FaLock, FaStar } from "react-icons/fa";
import classNames from "classnames";
import Link from "next/link";
import { ImExit } from "react-icons/im";
import Modal from "@web/components/Modal/Modal";
import { useRouter } from "next/router";

const ReactPlayerRoomSettings = dynamic(
  () => import("./ReactPlayerRoomSettings/ReactPlayerRoomSettings"),
  { ssr: false }
);
import dynamic from "next/dynamic";
import { useVideoSearchStore } from "./VideoSearch/VideoSearch";
import shallow from "zustand/shallow";

type FindByRoomIdentificationIdResponse =
  InferQueryOutput<"rooms.findByRoomIdentificationId">;

interface ReactPlayerRoomInfoProps extends FindByRoomIdentificationIdResponse {}

export default memo(function ReactPlayerRoomInfo(
  props: ReactPlayerRoomInfoProps
) {
  const router = useRouter();
  const trpcContext = trpc.useContext();
  const { user } = useMe();
  const { data: isRoomFavorited, isLoading: isRoomFavoritedLoading } =
    trpc.useQuery(["favorited-rooms.isRoomFavorited", { roomId: props.id }], {
      enabled: !!user && !!props.id,
    });

  const { showVideoSearchButtons, setShowVideoSearchButtons } =
    useVideoSearchStore(
      (s) => ({
        showVideoSearchButtons: s.showVideoSearchButtons,
        setShowVideoSearchButtons: s.setShowVideoSearchButtons,
      }),
      shallow
    );
  const showFavoriteButton =
    !!props.id &&
    !!user &&
    !!props.owner &&
    user.user.id !== props.owner.userId;

  const showSettingsButton = !!user && user.user.id === props.owner?.userId;

  const isAllowedToControlVideo =
    props.videoControlRights === "Everyone"
      ? true
      : user
      ? !!props.owner && user.user.id === props.owner?.userId
      : false;

  const { mutateAsync: toggle } = trpc.useMutation(["favorited-rooms.toggle"]);

  async function onToggleFavorites() {
    await toggle({ roomId: props.id });
    trpcContext.invalidateQueries([
      "favorited-rooms.isRoomFavorited",
      {
        roomId: props.id,
      },
    ]);
  }

  const [showShareWithYourFriendsModal, setShowShareWithYourFriendsModal] =
    useState(false);
  function onClickShareWithYourFriends() {
    setShowShareWithYourFriendsModal(!showShareWithYourFriendsModal);
  }

  return (
    <>
      <Modal
        onClose={onClickShareWithYourFriends}
        open={showShareWithYourFriendsModal}
        closeOnClickOutside
        showCloseButton
        containerClassName="w-[min(480px,100%)]"
        bodyClassName="flex flex-col w-full gap-4 p-2"
        title={`Share this room with your friends!`}
      >
        <p className="!m-0 py-4 text-sm">
          Let me them know that you want to watch videos with them by copying
          the link below:
        </p>
        <div
          className="tooltip tooltip-info"
          data-tip={`${process.env.NEXT_PUBLIC_WEB_BASE_URL}/rooms/${router.query.roomIdentificationId}`}
        >
          <p className="!m-0 text-center italic text-md font-bold py-4 rounded-md ring-info ring-1 relative break-all p-2">
            {process.env.NEXT_PUBLIC_WEB_BASE_URL?.substring(0, 20) + "..."}
            /rooms/
            {router.query.roomIdentificationId}
            <button
              aria-label="Copy link"
              className="mx-2 btn btn-xs btn-circle btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/rooms/${router.query.roomIdentificationId}`
                );
              }}
            >
              <FaCopy />
            </button>
          </p>
        </div>

        <div className="divider divider-vertical">or</div>
        <p className="!m-0 py-4 text-sm break-all">
          Enter this room ID after visiting{" "}
          <a
            href={process.env.NEXT_PUBLIC_WEB_BASE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-bold link link-info"
          >
            {process.env.NEXT_PUBLIC_WEB_BASE_URL}
          </a>
          :
        </p>
        <p className="text-4xl font-bold text-center !m-0 p-2 ring-1 ring-info rounded-md">
          {router.query.roomIdentificationId}
        </p>
      </Modal>
      <div className="flex items-center justify-between">
        <div>
          <div className="space-x-2">
            <h2 className="text-[1.2rem] md:text-2xl !m-0 inline-block max-w-[120px] md:max-w-none align-middle overflow-hidden overflow-ellipsis whitespace-nowrap">
              {props.name}
            </h2>
            <span className="inline-block ml-2 align-middle rounded-full badge badge-success badge-sm">
              {props.videoPlatform}
            </span>
            {props.private && (
              <FaLock className="inline w-3 h-auto align-middle" />
            )}
          </div>
          {!!props.owner?.user.name ? (
            <p className="!m-0 text-xs md:text-lg">
              Hosted by: {props.owner?.user.name}
            </p>
          ) : (
            <p className="!m-0 text-xs md:text-lg">Temporary Room</p>
          )}
        </div>
        <div className="flex gap-2">
          {isAllowedToControlVideo && (
            <div
              className="tooltip tooltip-info tooltip-left"
              data-tip="Search videos"
            >
              <button
                aria-label="Search videos"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() =>
                  setShowVideoSearchButtons(!showVideoSearchButtons)
                }
              >
                <FiSearch className="w-4 h-auto" />
              </button>
            </div>
          )}

          {showSettingsButton && <ReactPlayerRoomSettings id={props.id} />}

          <div
            className="tooltip tooltip-info tooltip-left"
            data-tip="Share with your friends"
          >
            <button
              aria-label="Share with your friends"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClickShareWithYourFriends}
            >
              <FiShare className="w-4 h-auto" />
            </button>
          </div>

          {showFavoriteButton && (
            <div
              className="tooltip tooltip-info tooltip-left"
              data-tip={
                !isRoomFavorited ? "Add to Favorites" : "Remove to Favorites"
              }
            >
              <button
                aria-label={
                  !isRoomFavorited ? "Add to Favorites" : "Remove to Favorites"
                }
                className={classNames(
                  "btn btn-ghost btn-sm btn-circle",
                  isRoomFavoritedLoading && "btn-disabled"
                )}
                onClick={onToggleFavorites}
              >
                <FaStar
                  className={classNames(
                    "w-4 h-auto",
                    isRoomFavorited &&
                      !isRoomFavoritedLoading &&
                      "text-amber-500"
                  )}
                />
              </button>
            </div>
          )}

          <div
            className="tooltip tooltip-info tooltip-left"
            data-tip="Exit Room"
          >
            <Link href="/" passHref>
              <a className="btn btn-ghost btn-sm btn-circle">
                <ImExit className="w-4 h-auto" />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
});
