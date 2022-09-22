import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";

import Modal from "@web/components/Modal/Modal";

import useChat from "./useChat";
const ChatNamePrompt = dynamic(() => import("./ChatNamePrompt"), {
  ssr: false,
  suspense: true,
});
const ChatItem = dynamic(() => import("./ChatItem"), {
  ssr: false,
  suspense: true,
});
const ChatTextarea = dynamic(() => import("./ChatTextarea"), {
  ssr: false,
  suspense: true,
});

export interface ChatProps {}

export default function Chat(props: ChatProps) {
  const ctx = useChat(props);

  return (
    <>
      <div
        className={classNames(
          "relative h-[50%] lg:h-screen flex flex-col shadow-xl",
          !ctx.collapsed ? "w-0" : "w-full lg:w-[400px]"
        )}
      >
        <button
          className="absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-primary shadow-2xl"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="flex flex-col justify-end flex-1 h-[50%] lg:h-screen bg-base-100">
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
                  <ChatItem key={chat.id} {...chat} owner={ctx.owner} />
                ))}
              </>
            )}
          </div>
          <ChatTextarea
            disabled={(ctx.isLoading || ctx.isFetching) && !!ctx.userName}
            onSend={ctx.onSend}
          />
        </section>
      </div>
    </>
  );
}
