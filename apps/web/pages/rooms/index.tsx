import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Container from "@web/components/Container/Container";
import { useRouter } from "next/router";
import { useRef } from "react";

export default function Rooms() {
  const router = useRouter();
  const { mutate: createRoom } = trpc.useMutation(["rooms.create"], {
    onSuccess(data) {
      router.push("/rooms/[room]", `/rooms/${data.id}`);
    },
  });

  const createRoomInputRef = useRef<HTMLInputElement>(null);
  const joinRoomInputRef = useRef<HTMLInputElement>(null);

  const { refetch } = trpc.useQuery(
    ["rooms.findById", joinRoomInputRef.current?.value!],
    {
      enabled: !!joinRoomInputRef.current?.value,
      onSuccess(data) {
        router.push("/rooms/[room]", `/rooms/${data.id}`);
      },
    }
  );

  function onCreateRoom() {
    if (!createRoomInputRef.current?.value) return;
    createRoom({ name: createRoomInputRef.current.value });
  }

  function onJoinRoom() {
    if (!joinRoomInputRef.current?.value) return;
    refetch();
  }

  return (
    <Container className="flex items-center justify-center gap-8">
      <div className="border-2 border-slate-600 rounded-lg w-[min(400px,90vw)] min-h-[min(400px,90vh)] p-4 text-center flex flex-col justify-center">
        <h1 className="text-2xl">Create a room</h1>

        <input
          ref={createRoomInputRef}
          className="w-full p-2 my-10 text-lg bg-slate-700/40"
          placeholder="Enter room name"
        />

        <Button size="lg" fullWidth onClick={onCreateRoom}>
          Create a room
        </Button>
      </div>
      or
      <div className="border-2 border-slate-600 rounded-lg w-[min(400px,90vw)] min-h-[min(400px,90vh)] p-4 text-center flex flex-col justify-center">
        <h1 className="text-2xl">Join an existing room</h1>

        <input
          ref={joinRoomInputRef}
          className="w-full p-2 my-10 text-lg bg-slate-700/40"
          placeholder="Enter room ID"
        />

        <Button size="lg" fullWidth onClick={onJoinRoom}>
          Join room
        </Button>
      </div>
    </Container>
  );
}
