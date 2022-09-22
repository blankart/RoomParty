import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import useLocalStorage from "@web/hooks/useLocalStorage";
import Error from "next/error";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaKey, FaSpinner } from "react-icons/fa";
import {
  CHAT_LOCAL_STORAGE_SESSION_KEY,
  CHAT_NAME_KEY,
} from "@rooms2watch/shared-lib";
import { BsPlayCircleFill } from "react-icons/bs";
import { RoomsDTO } from "@web/../../packages/trpc/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoomsSchema } from "@web/../../packages/trpc/schema";
import ChatNamePrompt from "../components/Chat/ChatNamePrompt";
import { useMe } from "@web/context/AuthContext";

const getLocalStorageKeyName = (id: string) => `${CHAT_NAME_KEY}.${id}`;

interface RoomContextState {
  password: string | null;
  localStorageSessionId?: number;
  roomTransientId: string | null;
  userName: string;
}

export const RoomContext = createContext<RoomContextState>({
  password: null,
  roomTransientId: null,
  userName: "",
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

function RoomWrapper(props: {
  title?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center prose max-w-none">
      <h1 className="text-3xl font-bold md:text-5xl">
        <BsPlayCircleFill className="inline mr-4" />
        rooms2watch
      </h1>
      <div className="w-[min(400px,100%)] p-8 shadow-2xl">
        <div className="flex gap-2 py-2 text-xl font-bold">{props.title}</div>
        {props.children}
      </div>
    </div>
  );
}

function RoomPasswordPrompt(props: RoomModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
    setValue,
  } = useForm<RoomsDTO.ValidatePasswordSchema>({
    mode: "onSubmit",
    resolver: zodResolver(RoomsSchema.validatePasswordSchema),
  });

  const { mutateAsync: validatePassword } = trpc.useMutation(
    ["rooms.validatePassword"],
    {
      onError(error) {
        setError("password", { message: error.message });
      },
      onSuccess() {
        props.setPassword(watch().password);
      },
    }
  );

  useEffect(() => {
    if (!props.roomIdentificationId) return;
    setValue("roomIdentificationId", props.roomIdentificationId);
  }, [props.roomIdentificationId]);

  async function onSubmit(data: RoomsDTO.ValidatePasswordSchema) {
    try {
      await validatePassword(data);
    } catch (e) {}
  }

  return (
    <RoomWrapper
      title={
        <>
          Enter room password <FaKey className="w-4 h-auto" />
        </>
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
          {...register("password")}
          error={errors?.password?.message}
        />
        <Button className="w-full mt-2 btn-sm">Let me in</Button>
      </form>
    </RoomWrapper>
  );
}

export function RoomProvider(props: { children?: React.ReactNode }) {
  const router = useRouter();
  const { user } = useMe();
  const roomIdentificationId = router.query.roomIdentificationId as
    | string
    | undefined;
  const {
    data: roomPermissions,
    isLoading: isRoomLoading,
    error,
    isIdle,
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
  const [userNameFromLocalStorage, setUserNameFromLocalStorage] =
    useLocalStorage<string | undefined>(
      getLocalStorageKeyName(roomIdentificationId ?? "")
    );

  const userName = user?.user?.name ?? userNameFromLocalStorage ?? "";

  trpc.useQuery(
    [
      "rooms.requestForRoomTransient",
      {
        roomIdentificationId: roomIdentificationId!,
        localStorageSessionId: localStorageSessionId!,
        password: password ?? "",
        userName,
      },
    ],
    {
      enabled:
        !!roomPermissions &&
        (roomPermissions.isAuthorizedToEnter
          ? !!roomIdentificationId && !!localStorageSessionId && !!userName
          : !!roomIdentificationId &&
            !!localStorageSessionId &&
            !!userName &&
            !!password),
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

  if (isRoomLoading || isIdle) {
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
      <RoomPasswordPrompt
        roomIdentificationId={roomIdentificationId}
        password={password}
        setPassword={setPassword}
        roomTransientId={roomTransientId}
        setRoomTransientId={setRoomTransientId}
        localStorageSessionId={localStorageSessionId}
      />
    );
  }

  if (roomPermissions && !userName) {
    return (
      <RoomWrapper title={<>Enter your name</>}>
        <div className="flex flex-col">
          <ChatNamePrompt
            onSetName={(prompt) => setUserNameFromLocalStorage(prompt.name)}
          />
        </div>
      </RoomWrapper>
    );
  }

  return (
    <RoomContext.Provider
      value={{
        password,
        localStorageSessionId,
        roomTransientId,
        userName,
      }}
    >
      {props.children}
    </RoomContext.Provider>
  );
}
