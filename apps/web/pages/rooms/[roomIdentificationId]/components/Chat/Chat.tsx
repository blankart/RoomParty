import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";
import useChat from "./useChat";
import { memo } from "react";
import { BsThreeDotsVertical, BsThreeDots } from "react-icons/bs";
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
          "relative lg:h-screen flex flex-col shadow-xl duration-500 transition-all",
          !ctx.collapsed
            ? "w-full md:w-0 h-0 md:h-[50%]"
            : "w-full lg:w-[400px] h-[50%]"
        )}
      >
        <button
          aria-label={ctx.collapsed ? "Uncollapse" : "Collapse"}
          className="hidden md:block absolute right-[100%] top-[50%] shadow-2xl z-10 bg-info p-0 w-4 h-20 rounded-l-md"
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        >
          <BsThreeDotsVertical className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-10 h-auto" />
        </button>
        <button
          className="absolute md:hidden bottom-[100%] left-[50%] translate-x-[-50%] rounded-t-lg rounded-b-none h-4 w-14 bg-info"
          aria-label={ctx.collapsed ? "Uncollapse" : "Collapse"}
          onClick={() => ctx.set({ collapsed: !ctx.collapsed })}
          title={ctx.collapsed ? "Uncollapse" : "Collapse"}
        >
          <BsThreeDots className="w-8 h-auto absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" />
        </button>
        <VideoCall />

        <section className="flex flex-col justify-end flex-1 h-full lg:h-screen bg-base-100 overflow-hidden relative w-full lg:w-[400px]">
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
              {/* {!ctx.isLoading && ctx.userName && !ctx.isFetching && (
                <>
                  {ctx.chats?.map((chat) => (
                    <ChatItem key={chat.id} {...chat} owner={ctx.owner} />
                  ))}
                </>
              )} */}

              {!ctx.isLoading && ctx.userName && !ctx.isFetching && (
                <>
                  {ctx.temporaryChats?.map((chat, i) => (
                    <ChatItem key={i} {...chat} owner={ctx.owner} />
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
