import classNames from "classnames";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";

const ChatOnlineUsers = dynamic(() => import("./ChatOnlineUsers"), {
  ssr: false,
});

export interface ChatTextareaForm {
  message: string;
}

interface ChatTextareaProps {
  onSend: (data: ChatTextareaForm) => any;
  disabled: boolean;
}

export default function ChatTextarea(props: ChatTextareaProps) {
  const { register, handleSubmit, reset } = useForm<ChatTextareaForm>({
    mode: "onSubmit",
  });

  function onSend(data: ChatTextareaForm) {
    props.onSend(data);
    setTimeout(() => {
      reset({ message: "" });
    }, 1);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSend)}
        className="flex flex-col w-full p-2 gap-y-2"
      >
        <textarea
          {...register("message")}
          disabled={props.disabled}
          className="h-20 p-2 resize-none bg-slate-700/50 textarea"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSubmit(onSend)();
            }
          }}
        />
        <div className="flex justify-between">
          <div>
            <ChatOnlineUsers />
          </div>
          <button
            className={classNames("btn btn-secondary btn-sm", {
              "btn-disabled": props.disabled,
            })}
          >
            Send
          </button>
        </div>
      </form>
    </>
  );
}
