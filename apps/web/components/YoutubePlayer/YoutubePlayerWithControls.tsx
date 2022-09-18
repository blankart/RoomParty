import classNames from "classnames";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Suspense } from "react";
import { FaCopy, FaStar } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { ImExit } from "react-icons/im";
import Modal from "../Modal/Modal";
import useYoutubePlayerWithControls from "./useYoutubePlayerWithControls";
import YoutubePlayerSetup from "./YoutubePlayerSetup";

const YoutubePlayer = dynamic(
  () => import("@web/components/YoutubePlayer/YoutubePlayer"),
  {
    ssr: false,
  }
);

export interface YoutubePlayerWithControlsProps {}

const YOUTUBE_PLAYER_CONFIG = {
  playerVars: { origin: process.env.NEXT_PUBLIC_WEB_BASE_URL },
};

const YOUTUBE_PLAYER_PROGRESS_INTERVAL = 1_000;

export default function YoutubePlayerWithControls(
  props: YoutubePlayerWithControlsProps
) {
  const ctx = useYoutubePlayerWithControls(props);

  return (
    <>
      <Modal
        onClose={ctx.onClickShareWithYourFriends}
        open={ctx.showShareWithYourFriendsModal}
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
          className="tooltip tooltip-accent"
          data-tip={`${process.env.NEXT_PUBLIC_WEB_BASE_URL}/rooms/${ctx.router.query.roomIdentificationId}`}
        >
          <p className="!m-0 text-center italic text-md font-bold py-4 rounded-md ring-accent ring-1 relative break-all p-2">
            {process.env.NEXT_PUBLIC_WEB_BASE_URL?.substring(0, 20) + "..."}
            /rooms/
            {ctx.router.query.roomIdentificationId}
            <button
              className="mx-2 btn btn-xs btn-circle btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/rooms/${ctx.router.query.roomIdentificationId}`
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
            className="font-bold link link-accent"
          >
            {process.env.NEXT_PUBLIC_WEB_BASE_URL}
          </a>
          :
        </p>
        <p className="text-4xl font-bold text-center !m-0 p-2 ring-1 ring-accent rounded-md">
          {ctx.router.query.roomIdentificationId}
        </p>
      </Modal>
      <div className="flex flex-col flex-1 w-full max-h-screen bg-base-100">
        <div className="relative flex-1 w-full bg-base-100">
          <Suspense>
            <YoutubePlayerSetup />
            <YoutubePlayer
              onStart={ctx.onStart}
              onPause={ctx.onPause}
              onPlay={ctx.onPlay}
              onSeek={ctx.onSeek}
              progressInterval={YOUTUBE_PLAYER_PROGRESS_INTERVAL}
              stopOnUnmount
              controls
              youtubePlayerRef={ctx.youtubePlayerRef}
              width="100%"
              height="100%"
              url={ctx.url}
              config={YOUTUBE_PLAYER_CONFIG}
            />
          </Suspense>
        </div>
        <div className="flex items-center justify-between p-4 py-6 bg-base-200">
          <div>
            <div>
              <h2 className="text-[1.2rem] md:text-2xl !m-0 inline-block max-w-[150px] md:max-w-none align-middle overflow-hidden overflow-ellipsis whitespace-nowrap">
                {ctx.name}
              </h2>
              <span className="inline-block ml-2 align-middle rounded-full badge badge-success badge-sm">
                {ctx.videoPlatform}
              </span>
            </div>
            {!!ctx.ownerName && (
              <p className="!m-0 text-xs md:text-lg">
                Hosted by: {ctx.ownerName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <div
              className="tooltip tooltip-primary tooltip-left"
              data-tip={"Share with your frients"}
            >
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={ctx.onClickShareWithYourFriends}
              >
                <FiShare className="w-4 h-auto" />
              </button>
            </div>

            {ctx.showFavoriteButton && (
              <div
                className="tooltip tooltip-primary tooltip-left"
                data-tip={
                  ctx.isRoomFavorited
                    ? "Add to Favorites"
                    : "Remove to Favorites"
                }
              >
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={ctx.onToggleFavorites}
                >
                  <FaStar
                    className={classNames(
                      "w-4 h-auto",
                      ctx.isRoomFavorited && "text-amber-500"
                    )}
                  />
                </button>
              </div>
            )}

            <div
              className="tooltip tooltip-primary tooltip-left"
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
      </div>
    </>
  );
}
