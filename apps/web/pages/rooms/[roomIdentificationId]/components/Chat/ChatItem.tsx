import { InferQueryOutput } from "@web/types/trpc";

export type ChatsQueryOutput = InferQueryOutput<"chats.chats">[number];

interface ChatItemProps extends ChatsQueryOutput {
  owner: string | undefined;
}

export default function ChatItem(props: ChatItemProps) {
  return (
    <div className="w-full p-1 break-word hover:bg-slate-600/20">
      {props.isSystemMessage ? (
        <>
          <span className="block py-2 text-xs italic text-center opacity-50 md:text-sm">
            {props.message}
          </span>
        </>
      ) : (
        <div className="text-xs break-words md:text-sm">
          <b style={props.color ? { color: props.color } : {}}>
            {props.name}
            {props.userId === props.owner && (
              <span
                className="inline-block m-0 ml-2 mb-1 text-[0.9rem] align-middle tooltip tooltip-primary"
                data-tip="Room Host"
              >
                👑
              </span>
            )}
          </b>
          : {props.message}
        </div>
      )}
    </div>
  );
}
