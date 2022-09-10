import { trpc } from "@web/api";
import { useRouter } from "next/router";
import { useRef } from "react";

export default function Rooms() {
  const router = useRouter();
  const { mutate: createRoom, data } = trpc.useMutation(["rooms.create"], {
    onSuccess(data) {
      router.push("/rooms/[room]", `/rooms/${data.id}`, { shallow: true });
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);

  function onCreateRoom() {
    if (!inputRef.current?.value) return;
    createRoom({ name: inputRef.current.value });
  }

  return (
    <div className="max-w-[600px] mx-auto prose dark:prose-invert min-h-screen dark:prose-invert">
      <input
        ref={inputRef}
        className="w-full rounded-lg my-4 text-[4rem] p-4"
        placeholder="Enter room name"
      />
      <button
        className="w-full text-[4rem] bg-slate-600 p-2 my-4 rounded-lg hover:opacity-90 duration-300 hover:-translate-y-2 hover:shadow-lg"
        onClick={onCreateRoom}
      >
        Create Room
      </button>
    </div>
  );
}
