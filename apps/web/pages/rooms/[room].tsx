import { createTRPCClient, trpc } from "@web/api";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRef } from "react";
import { useQueryClient } from "react-query";

export default function Room(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const queryClient = useQueryClient();

  const { data: chats } = trpc.useQuery(["chats.chats", props.id!], {
    enabled: !!props.id,
    initialData: props.chats,
  });

  trpc.useSubscription(["chats.chatSubscription", props.id!], {
    enabled: !!props.id,
    onNext: (data) => {
      queryClient.setQueryData(["chats.chats", props.id], (old: any) => [
        ...old,
        data,
      ]);
    },
  });

  const { mutate: sendChat } = trpc.useMutation(["chats.send"]);

  const inputRef = useRef<HTMLInputElement>(null);

  function onSend() {
    if (!inputRef.current?.value || !props.id) return;
    sendChat({ name: "Nico", message: inputRef.current.value, id: props.id });
    inputRef.current.value = "";
    inputRef.current.focus();
  }

  return (
    <div className="max-w-[600px] mx-auto prose dark:prose-invert min-h-screen dark:prose-invert">
      <input
        ref={inputRef}
        className="w-full rounded-lg my-4 text-[4rem] p-4"
        placeholder="Enter message"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
      />
      <button
        className="w-full text-[4rem] bg-slate-600 p-2 my-4 rounded-lg hover:opacity-90 duration-300 hover:-translate-y-2 hover:shadow-lg"
        onClick={onSend}
      >
        Send Message
      </button>

      <div className="mt-10">
        {chats?.map((chat) => (
          <div
            key={chat.id}
            className="text-[3rem] bg-slate-800 rounded-xl p-4 px-8 my-4"
          >
            {chat.name}: {chat.message}
            <div className="text-[2rem] mt-4">
              {chat.createdAt.toISOString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const room = ctx.params?.room as string | undefined;
  if (room) {
    try {
      const res = await createTRPCClient().query("rooms.findById", room);
      return {
        props: {
          id: res.id,
          name: res.name,
          chats: res.chats,
        },
      };
    } catch (e) {
      return {
        notFound: true,
        props: {},
      };
    }
  } else {
    return {
      notFound: true,
      props: {},
    };
  }
}
