import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";

import { RoomsDTO } from "@rooms2watch/trpc/dto";
import { RoomsSchema } from "@rooms2watch/trpc/schema";

import { trpc } from "@web/api";
import Input from "@web/components/Input/Input";

import BaseCard from "./BaseCard";

interface JoinARoomCardProps {}

export default function JoinARoomCard(props: JoinARoomCardProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RoomsDTO.FindByRoomIdentificationIdSchema>({
    mode: "onSubmit",
    resolver: zodResolver(RoomsSchema.findByRoomIdentificationIdSchema),
  });

  const [enableQuery, setEnableQuery] = useState(false);

  const formData = watch();

  trpc.useQuery(["rooms.findByRoomIdentificationId", formData], {
    enabled: enableQuery,
    onSuccess(data) {
      router.push("/rooms/[room]", `/rooms/${data.roomIdentificationId}`);
    },
    onError(err) {
      setError("roomIdentificationId", err);
      setEnableQuery(false);
    },
  });

  async function onJoinRoom(data: RoomsDTO.FindByRoomIdentificationIdSchema) {
    setEnableQuery(true);
  }

  return (
    <BaseCard>
      <div className="flex flex-col card-body">
        <h1 className="card-title">Join an existing room</h1>
        <form
          onSubmit={handleSubmit(onJoinRoom)}
          className="flex flex-col justify-center flex-1 gap-3"
        >
          <h3>Join an existing room by entering the room ID below!</h3>
          <div className="flex flex-col">
            <Input
              type="text"
              placeholder="Enter room ID"
              {...register("roomIdentificationId")}
              error={errors.roomIdentificationId?.message}
            />
          </div>
          <button className="btn btn-secondary">Join room</button>
        </form>
      </div>
    </BaseCard>
  );
}