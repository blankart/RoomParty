import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import Modal from "@web/components/Modal/Modal";
import useLocalStorage from "@web/hooks/useLocalStorage";
import Error from "next/error";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaKey, FaSpinner } from "react-icons/fa";
import { CHAT_LOCAL_STORAGE_SESSION_KEY } from "@rooms2watch/shared-lib";

interface RoomContextState {
  password: string | null;
  localStorageSessionId?: number;
  roomTransientId: string | null;
}

export const RoomContext = createContext<RoomContextState>({
  password: null,
  roomTransientId: null,
});

export const useRoomContext = () => useContext(RoomContext);

interface RoomModalProps {
  roomIdentificationId?: string;
  password: string | null;
  setPassword: (newPassword: string | null) => any;
  roomTransientId: string | null;
  setRoomTransientId: (newPassword: string | null) => any;
  localStorageSessionId?: number;
}

function RoomModal(props: RoomModalProps) {
  const [enableQuery, setEnableQuery] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
  } = useForm<{ password: string }>({
    mode: "onSubmit",
  });

  trpc.useQuery(
    [
      "rooms.requestForRoomTransient",
      {
        roomIdentificationId: props.roomIdentificationId!,
        localStorageSessionId: props.localStorageSessionId!,
        ...watch(),
      },
    ],
    {
      enabled: !!enableQuery,
      onSettled() {
        setEnableQuery(false);
      },
      onSuccess(data) {
        props.setPassword(watch().password);
        props.setRoomTransientId(data.id);
      },
      onError(error) {
        setError("password", { message: error.message });
      },
    }
  );

  function onSubmit() {
    setEnableQuery(true);
  }

  return (
    <Modal
      onClose={() => {}}
      open={true}
      title={
        <div className="flex gap-2">
          Enter room password <FaKey className="w-4 h-auto" />
        </div>
      }
    >
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm">
          This room is password protected. Please enter room password.
        </p>
        <Input
          type="password"
          placeholder="********"
          className="mt-4"
          {...register("password", { required: "Password is required." })}
          error={errors?.password?.message}
        />
        <Button className="w-full mt-2 btn-sm">Let me in</Button>
      </form>
    </Modal>
  );
}

export function RoomProvider(props: { children?: React.ReactNode }) {
  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;
  const {
    data: roomPermissions,
    isLoading: isRoomLoading,
    error,
  } = trpc.useQuery(
    [
      "rooms.getRoomPermissions",
      { roomIdentificationId: roomIdentificationId! },
    ],
    {
      enabled: !!roomIdentificationId,
    }
  );

  const [password, setPassword] = useState<string | null>(null);
  const [roomTransientId, setRoomTransientId] = useState<string | null>(null);
  const [localStorageSessionId, setLocalStorageSessionId] = useLocalStorage<
    undefined | number
  >(CHAT_LOCAL_STORAGE_SESSION_KEY);

  trpc.useQuery(
    [
      "rooms.requestForRoomTransient",
      {
        roomIdentificationId: roomIdentificationId!,
        localStorageSessionId: localStorageSessionId!,
      },
    ],
    {
      enabled:
        !!roomIdentificationId &&
        !!localStorageSessionId &&
        roomPermissions?.isAuthorizedToEnter,
      onSuccess(data) {
        setRoomTransientId(data.id);
      },
    }
  );

  useEffect(() => {
    if (localStorageSessionId) return;
    setLocalStorageSessionId(
      Math.floor((Math.random() * 1_000_000_000) % 1_000_000_000)
    );
  }, []);

  if (isRoomLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <FaSpinner className="w-10 h-auto animate-spin" />
      </div>
    );
  }

  if (!isRoomLoading && error) {
    return <Error statusCode={error.data?.httpStatus ?? 404} />;
  }

  if (
    roomPermissions &&
    !roomPermissions.isAuthorizedToEnter &&
    !password &&
    !roomTransientId
  ) {
    return (
      <RoomModal
        roomIdentificationId={roomIdentificationId}
        password={password}
        setPassword={setPassword}
        roomTransientId={roomTransientId}
        setRoomTransientId={setRoomTransientId}
        localStorageSessionId={localStorageSessionId}
      />
    );
  }

  return (
    <RoomContext.Provider
      value={{ password, localStorageSessionId, roomTransientId }}
    >
      {props.children}
    </RoomContext.Provider>
  );
}
