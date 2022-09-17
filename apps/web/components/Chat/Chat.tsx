import classNames from "classnames";
import { IoMdExit } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { AiOutlineCheckCircle } from "react-icons/ai";

import Modal from "../Modal/Modal";
import useChat from "./useChat";
import { useMe } from "@web/context/AuthContext";

export interface ChatProps {}

export default function Chat(props: ChatProps) {
  const ctx = useChat(props);
  const { isLoading, isIdle } = useMe();

  return (
    <>
      <Modal
        onClose={() => {}}
        open={ctx.showPrompt}
        containerClassName="w-[min(500px,90vw)]"
        bodyClassName="flex flex-col w-full gap-4"
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
                Welcome to <b>{ctx.name}</b>&apos;s room!
              </h1>
              <div className="flex gap-2">
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
                      <IoMdExit className="w-5 h-auto" />
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
            {!isLoading && !isIdle && (
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
                        <b>
                          {chat.name}
                          {chat.userId === ctx.owner && (
                            <span
                              className="ml-1 tooltip tooltip-primary"
                              data-tip="Host"
                            >
                              <AiOutlineCheckCircle
                                title="Host"
                                className="inline mb-1"
                              />
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
              className="h-20 p-2 resize-none bg-slate-700/50 textarea"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                ctx.onSend();
              }}
            />
            <div className="flex justify-between">
              <div />
              <button className="btn btn-secondary btn-sm" onClick={ctx.onSend}>
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
