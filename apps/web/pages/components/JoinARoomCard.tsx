import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";

import type { RoomsDTO } from "@RoomParty/trpc/dto";
import { RoomsSchema } from "@RoomParty/trpc/schema";

import { trpc } from "@web/trpc";
import Input from "@web/components/Input/Input";
import Button from "@web/components/Button/Button";

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
  } = useForm<RoomsDTO.GetRoomInitialMetadataSchema>({
    mode: "onSubmit",
    resolver: zodResolver(RoomsSchema.findByRoomIdentificationIdSchema),
  });

  const [enableQuery, setEnableQuery] = useState(false);

  const formData = watch();

  const { isFetching } = trpc.useQuery(
    ["rooms.getRoomInitialMetadata", formData],
    {
      enabled: enableQuery,
      onSuccess(data) {
        router.push("/rooms/[room]", `/rooms/${data.roomIdentificationId}`);
        setEnableQuery(false);
      },
      onError(err) {
        setError("roomIdentificationId", {
          type: "custom",
          message: err.message,
        });
        setEnableQuery(false);
      },
    }
  );

  async function onJoinRoom(data: RoomsDTO.GetRoomInitialMetadataSchema) {
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
          <h2 className="text-lg lg:text-2xl">
            Join an existing room by entering the room ID below!
          </h2>
          <div className="flex flex-col">
            <Input
              type="text"
              maxLength={8}
              placeholder="Enter room ID"
              {...register("roomIdentificationId")}
              error={errors.roomIdentificationId?.message}
              disabled={isFetching}
            />
          </div>
          <Button
            className="btn-sm lg:btn-md"
            loading={isFetching}
            disabled={isFetching}
            aria-label="Join room"
          >
            Join room
          </Button>
        </form>
      </div>
    </BaseCard>
  );
}
