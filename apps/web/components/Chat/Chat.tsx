import classNames from "classnames";
import { FaCopy, FaSpinner, FaStar } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import Link from "next/link";
import { ImExit } from "react-icons/im";

import Modal from "../Modal/Modal";
import useChat from "./useChat";

export interface ChatProps {}

export default function Chat(props: ChatProps) {
  const ctx = useChat(props);

  return (
    <>
      <Modal
        onClose={() => {}}
        open={ctx.showPrompt}
        containerClassName="w-[min(400px,100%)]"
        bodyClassName="flex flex-col w-full gap-4"
        title={`Welcome to ${ctx.name}'s room!`}
      >
        <p className="!m-0 py-4 text-sm">
          Let me know your name so we can let you in!
        </p>
        <input
          ref={ctx.nameInputRef}
          placeholder="Your name"
          className="input input-bordered input-primary"
        />

        <button className="w-full btn btn-primary" onClick={ctx.onSetName}>
          Let me in!
        </button>
      </Modal>

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

      <div
        className={classNames(
          "relative h-[60vh] lg:h-screen flex flex-col shadow-xl",
          !ctx.collapsed ? "w-0" : "w-full lg:w-[400px]"
        )}
      >
        <button
          className="absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-primary shadow-2xl"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="flex flex-col justify-end flex-1 h-[60vh] lg:h-screen bg-base-100">
          <section className="w-full p-4 bg-primary-focus">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-sm font-normal !m-0">
                Welcome to <b>{ctx.name}</b>
              </h1>
              <div className="flex gap-2">
                <div
                  className="tooltip tooltip-primary tooltip-left"
                  data-tip={"Share with your frients"}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={ctx.onClickShareWithYourFriends}
                  >
                    <FiShare className="w-4 h-auto" />
                  </button>
                </div>
                {ctx.showFavoriteButton && (
                  <div
                    className="tooltip tooltip-primary tooltip-left"
                    data-tip={
                      !ctx.isRoomFavorited
                        ? "Add to Favorites"
                        : "Remove to Favorites"
                    }
                  >
                    <button
                      className="btn btn-ghost btn-sm"
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
                    <a className="btn btn-ghost btn-sm">
                      <ImExit className="w-5 h-auto" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <div
            ref={ctx.chatsRef}
            className={classNames("p-2 overflow-y-auto relative flex-1", {
              "blur-sm": !ctx.shouldEnableQueries,
            })}
          >
            {(ctx.isLoading || ctx.isFetching) && !!ctx.userName && (
              <div className="flex items-center justify-center h-full">
                <FaSpinner className="w-10 h-auto animate-spin" />
              </div>
            )}
            {!ctx.isLoading && ctx.userName && !ctx.isFetching && (
              <>
                {ctx.chats?.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-1 break-all hover:bg-slate-600/20"
                  >
                    {chat.isSystemMessage ? (
                      <>
                        <span className="block py-2 text-sm italic text-center opacity-50">
                          {chat.message}
                        </span>
                      </>
                    ) : (
                      <div>
                        <b style={chat.color ? { color: chat.color } : {}}>
                          {chat.name}
                          {chat.userId === ctx.owner && (
                            <span
                              className="inline-block m-0 ml-2 mb-1 text-[0.9rem] align-middle tooltip tooltip-primary"
                              data-tip="Room Host"
                            >
                              👑
                            </span>
                          )}
                        </b>
                        : {chat.message}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="flex flex-col w-full p-2 gap-y-2">
            <textarea
              ref={ctx.inputRef}
              disabled={(ctx.isLoading || ctx.isFetching) && !!ctx.userName}
              className="h-20 p-2 resize-none bg-slate-700/50 textarea"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                ctx.onSend();
              }}
            />
            <div className="flex justify-between">
              <div />
              <button
                className={classNames("btn btn-secondary btn-sm", {
                  "btn-disabled":
                    (ctx.isLoading || ctx.isFetching) && !!ctx.userName,
                })}
                onClick={ctx.onSend}
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
