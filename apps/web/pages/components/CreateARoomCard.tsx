import { BsPlayCircleFill } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";

import type { RoomsDTO } from "@partyfy/trpc/dto";
import { RoomsSchema } from "@partyfy/trpc/schema";

import Input from "@web/components/Input/Input";
import { trpc } from "@web/api";

import BaseCard from "./BaseCard";
import Button from "@web/components/Button/Button";

export default function CreateARoomCard() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RoomsDTO.CreateSchema>({
    mode: "onSubmit",
    resolver: zodResolver(RoomsSchema.createSchema),
  });

  const { mutateAsync: createRoom, isLoading } = trpc.useMutation([
    "rooms.create",
  ]);

  async function onCreateRoom(data: RoomsDTO.CreateSchema) {
    try {
      const res = await createRoom(data);
      router.push("/rooms/[room]", `/rooms/${res.roomIdentificationId}`);
    } catch (e) {
      setError("name", e as any);
    }
  }

  return (
    <BaseCard>
      <div className="flex flex-col card-body">
        <h1 className="card-title">
          <BsPlayCircleFill className="inline mr-2" />
          Create a room
        </h1>
        <form
          onSubmit={handleSubmit(onCreateRoom)}
          className="flex flex-col justify-center flex-1 gap-3"
        >
          <h3>
            Create a room and watch <FaYoutube className="inline mb-1" />{" "}
            together with your friends!
          </h3>
          <div className="flex flex-col">
            <Input
              type="text"
              placeholder="Enter your room name"
              {...register("name")}
              error={errors.name?.message}
              disabled={isLoading}
            />
          </div>
          <Button loading={isLoading} disabled={isLoading}>
            Create a room
          </Button>
        </form>
      </div>
    </BaseCard>
  );
}
