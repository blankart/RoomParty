import { TemporaryChat } from "@RoomParty/trpc";
// import { InferQueryOutput } from "@web/types/trpc";
import reactStringReplace from "react-string-replace";

// export type ChatsQueryOutput = InferQueryOutput<"chats.chats">[number];

// interface ChatItemProps extends ChatsQueryOutput {
//   owner: string | undefined;
// }

interface ChatItemProps extends TemporaryChat {
  owner: string | undefined;
}

function parseMessage(message: string) {
  let finalMessage = reactStringReplace(
    message,
    /\[img\]\[(http.*)\]/g,
    (match, i) => (
      <img src={match} className="max-w-[300px] max-h-[800px] object-contain" />
    )
  );

  return finalMessage;
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
                className="inline-block m-0 ml-2 mb-1 text-[0.9rem] align-middle tooltip tooltip-secondary"
                data-tip="Room Host"
              >
                👑
              </span>
            )}
          </b>
          :<>{parseMessage(props.message)}</>
        </div>
      )}
    </div>
  );
}
