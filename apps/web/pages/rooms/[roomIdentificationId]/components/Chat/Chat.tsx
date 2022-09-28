import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";
import useChat from "./useChat";
import { memo, useState } from "react";
import Button from "@web/components/Button/Button";
const ChatItem = dynamic(() => import("./ChatItem"), {
  ssr: false,
});
const ChatTextarea = dynamic(() => import("./ChatTextarea"), {
  ssr: false,
});
const VideoCall = dynamic(() => import("../VideoCall/VideoCall"), {
  ssr: false,
});

export interface ChatProps {}

export default memo(function Chat(props: ChatProps) {
  const ctx = useChat(props);

  return (
    <>
      <div
        className={classNames(
          "relative lg:h-screen flex flex-col shadow-xl",
          !ctx.collapsed
            ? "w-full md:w-0 h-0 md:h-[50%]"
            : "w-full lg:w-[400px] h-[50%]"
        )}
      >
        <button
          aria-label={ctx.collapsed ? "Uncollapse" : "Collapse"}
          className="hidden md:block absolute right-[100%] top-[50%] w-4 h-20 rounded-l-full bg-primary shadow-2xl z-10"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        />
        <section className="p-0 md:p-4 bg-base-200 tabs">
          <VideoCall />
        </section>

        <section className="flex flex-col justify-end flex-1 h-[50%] lg:h-screen bg-base-100 overflow-hidden relative">
          <section className="absolute inset-0 flex flex-col justify-end flex-1 h-full overflow-hidden bg-base-100">
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
        </section>

        {/* <section className="flex flex-col justify-end flex-1 h-[50%] lg:h-screen bg-base-100 overflow-hidden relative">
          <section className="absolute inset-0 flex flex-col justify-end flex-1 h-full overflow-hidden bg-base-100">
            <VideoCall />
          </section>
        </section> */}
      </div>
    </>
  );
});
