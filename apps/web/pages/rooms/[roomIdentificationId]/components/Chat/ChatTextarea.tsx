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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatTextareaForm>({
    mode: "onSubmit",
  });

  function onSend(data: ChatTextareaForm) {
    props.onSend(data);
    reset({ message: "" });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSend)}
        className="flex flex-col w-full p-2 gap-y-2"
      >
        <input
          {...register("message", {
            maxLength: {
              value: 200,
              message: "Chat should not exceed 50 characters.",
            },
          })}
          disabled={props.disabled}
          className={classNames(
            "p-2 input bg-slate-700/50",
            !!errors?.message?.message && "input-error text-error"
          )}
        />
        <div className="flex items-center justify-between">
          <div>
            <ChatOnlineUsers />
          </div>
          <button
            aria-label="Send"
            className={classNames("btn btn-info btn-xs md:btn-sm", {
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
