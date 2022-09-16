import classNames from "classnames";

import useChat from "./useChat";
import Button from "../Button/Button";
import { AiOutlineCheckCircle } from "react-icons/ai";

export interface ChatProps {}

export default function Chat(props: ChatProps) {
  const ctx = useChat(props);

  return (
    <>
      {ctx.showPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90">
          <div className="bg-slate-800 rounded-xl w-[min(500px,90vw)] min-h-[min(400px,90vh)] p-10 flex flex-col justify-center shadow-xl">
            <h1 className="py-4 text-2xl font-normal text-center break-words">
              Welcome to <b>{ctx.name}</b>&apos;s room!
            </h1>
            <p className="py-2 text-center">
              Let me know your name so we can let you in!
            </p>
            <input
              ref={ctx.nameInputRef}
              placeholder="Your name"
              className="w-full p-2 my-10 text-lg bg-slate-700/40"
            />

            <Button onClick={ctx.onSetName} fullWidth size="lg">
              Let me in!
            </Button>
          </div>
        </div>
      )}
      <div
        className={classNames(
          "relative !h-screen flex flex-col shadow-xl",
          !ctx.collapsed ? "w-0" : "!w-[400px]"
        )}
      >
        <button
          className="absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-slate-700 shadow-2xl"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="flex-1 bg-slate-900 flex flex-col justify-end !h-screen">
          <section className="w-full p-4 bg-blue-800">
            <h1 className="text-sm font-normal !m-0">
              Welcome to <b>{ctx.name}</b>&apos;s room!
            </h1>
          </section>
          <div
            ref={ctx.chatsRef}
            className={classNames("p-2 overflow-y-auto relative flex-1", {
              "blur-sm": !ctx.shouldEnableQueries,
            })}
          >
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
                  <div className="py-1">
                    <b>
                      {chat.name}
                      {chat.userId === ctx.owner && (
                        <>
                          {" "}
                          <AiOutlineCheckCircle
                            title="Host"
                            className="inline mb-1"
                          />
                        </>
                      )}{" "}
                    </b>
                    : {chat.message}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full p-2 gap-y-2">
            <textarea
              ref={ctx.inputRef}
              className="h-20 p-2 resize-none bg-slate-700/50 "
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                ctx.onSend();
              }}
            />
            <div className="flex justify-between">
              <div />
              <Button onClick={ctx.onSend}>Send</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
