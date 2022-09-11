import useChat from "./useChat";
import classNames from "classnames";
import Button from "../Button/Button";
import { useRoomsStore } from "@web/store/rooms";
import shallow from "zustand/shallow";

export interface ChatProps {}

export default function Chat(props: ChatProps) {
  const {
    nameInputRef,
    onSetName,
    inputRef,
    onSend,
    shouldEnableQueries,
    chatsRef,
    chats,
    collapsed,
    showPrompt,
    set,
    name,
  } = useChat(props);

  return (
    <>
      {showPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90">
          <div className="bg-slate-900 w-[min(400px,90vw)] min-h-[min(400px,90vh)] p-4">
            <h2 className="py-4 text-2xl text-center break-words">
              Welcome to {name}&apos;s room!
            </h2>
            <p className="py-2 text-center">
              Let me know your name so we can let you in!
            </p>
            <input
              ref={nameInputRef}
              placeholder="Your name"
              className="w-full p-2 my-10 text-lg bg-slate-700/40"
            />

            <Button onClick={onSetName} fullWidth size="lg">
              Let me in!
            </Button>
          </div>
        </div>
      )}
      <div
        className={classNames(
          "relative !h-screen flex flex-col",
          !collapsed ? "w-0" : "!w-[400px]"
        )}
      >
        <button
          className="absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-slate-700 shadow-2xl"
          onClick={() => set({ collapsed: !collapsed })}
          title={collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="flex-1 bg-slate-900 flex flex-col justify-end !h-screen">
          <section className="w-full p-4 bg-blue-800">
            <h1>
              Welcome to <b>{name}</b>&apos;s room!
            </h1>
          </section>
          <div
            ref={chatsRef}
            className={classNames("p-2 overflow-y-auto relative flex-1", {
              "blur-sm": !shouldEnableQueries,
            })}
          >
            {chats?.map((chat) => (
              <div
                key={chat.id}
                className="p-1 break-words hover:bg-slate-600/20"
              >
                {chat.isSystemMessage ? (
                  <>
                    <span className="block py-2 text-sm italic text-center opacity-50">
                      {chat.message}
                    </span>
                  </>
                ) : (
                  <>
                    <b>{chat.name}</b>: {chat.message}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full p-2 gap-y-2">
            <textarea
              ref={inputRef}
              className="h-20 p-2 resize-none bg-slate-700/50 "
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                onSend();
              }}
            />
            <div className="flex justify-between">
              <div />
              <Button onClick={onSend}>Send</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
