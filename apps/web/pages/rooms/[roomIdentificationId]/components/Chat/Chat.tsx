import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";

import Modal from "../../../../../components/Modal/Modal";
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

      <div
        className={classNames(
          "relative h-[50vh] lg:h-screen flex flex-col shadow-xl",
          !ctx.collapsed ? "w-0" : "w-full lg:w-[400px]"
        )}
      >
        <button
          className="absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-primary shadow-2xl"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="flex flex-col justify-end flex-1 h-[50vh] lg:h-screen bg-base-100">
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
                        <span className="block py-2 text-xs italic text-center opacity-50 md:text-sm">
                          {chat.message}
                        </span>
                      </>
                    ) : (
                      <div className="text-xs md:text-sm">
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
