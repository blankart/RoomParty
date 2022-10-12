import { trpc } from "@web/trpc";
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
} from "@RoomParty/shared-lib";
import { BsPlayCircleFill } from "react-icons/bs";
import { RoomsDTO } from "@web/../../packages/trpc/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoomsSchema } from "@web/../../packages/trpc/schema";
import ChatNamePrompt from "../components/Chat/ChatNamePrompt";
import { useMe } from "@web/context/AuthContext";
import { useRoomsStore } from "../store/rooms";
import { useToast } from "@web/pages/components/Toast";

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
  name: string;
}

function RoomWrapper(props: {
  title?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center prose max-w-none">
      <video
        className="absolute inset-0 w-full opacity-5  blur-lg !m-0 h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/images/bg.mp4" type="video/mp4" />
      </video>
      <h1 className="text-3xl font-bold md:text-5xl">
        <BsPlayCircleFill className="inline mr-4" />
        RoomParty
      </h1>
      <div className="w-[min(400px,100%)] p-8 shadow-2xl bg-base-100 z-20">
        <div className="py-2 space-x-2 text-xl font-bold">{props.title}</div>
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
          <span className="inline-block font-normal">
            Enter room password for
          </span>{" "}
          {props.name}{" "}
          <FaKey className="inline-block w-4 h-auto align-middle" />
        </>
      }
    >
      <form
        className="flex flex-col bg-base-100"
        onSubmit={handleSubmit(onSubmit)}
      >
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
    refetch: refetchRoomInitialMetadata,
  } = trpc.useQuery(
    [
      "rooms.getRoomInitialMetadata",
      { roomIdentificationId: roomIdentificationId! },
    ],
    {
      enabled: !!roomIdentificationId,
    }
  );

  const context = trpc.useContext();
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

  const shouldBeAllowedToQuery =
    !!roomPermissions &&
    (roomPermissions.isAuthorizedToEnter
      ? !!roomIdentificationId && !!localStorageSessionId && !!userName
      : !!roomIdentificationId &&
        !!localStorageSessionId &&
        !!userName &&
        !!password);

  const { refetch: refetchRequestForRoomTransient } = trpc.useQuery(
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
      enabled: shouldBeAllowedToQuery,
      onSuccess(data) {
        setRoomTransientId(data.id);
      },
      onError() {
        setPassword(null);
        setRoomTransientId(null);
      },
    }
  );

  useEffect(() => {
    if (localStorageSessionId) return;
    setLocalStorageSessionId(
      Math.floor((Math.random() * 1_000_000_000) % 1_000_000_000)
    );
  }, []);

  const { add } = useToast();

  trpc.useSubscription(
    [
      "rooms.subscribeToRoomMetadata",
      {
        roomIdentificationId: roomIdentificationId!,
        password: password ?? "",
      },
    ],
    {
      enabled: shouldBeAllowedToQuery,
      onNext(data) {
        const isCurrentUserOwner =
          useRoomsStore.getState().owner === user?.user.id;

        if (data.type === "CHANGED_PASSWORD") {
          !isCurrentUserOwner && refetchRoomInitialMetadata();
          !isCurrentUserOwner && refetchRequestForRoomTransient();
          add("The owner has changed the password", "warning");
          return;
        }

        if (data.type === "CHANGED_ROOM_PRIVACY") {
          !isCurrentUserOwner &&
            context.invalidateQueries(["rooms.findByRoomIdentificationId"]);
          if (data.value) {
            !isCurrentUserOwner && refetchRoomInitialMetadata();
            !isCurrentUserOwner && refetchRequestForRoomTransient();
            add("The owner has set the room to private.", "warning");
          } else {
            add("The owner has set the room to public.");
          }
        }

        if (data.type === "CHANGED_CONTROL_RIGHTS") {
          !isCurrentUserOwner &&
            context.invalidateQueries(["rooms.findByRoomIdentificationId"]);

          if (data.value === "OwnerOnly")
            add("The owner has set the control rights to owner-only.");
          if (data.value === "Everyone")
            add("The owner has set the control rights to everyone.");
        }
      },
    }
  );

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
        name={roomPermissions.name}
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
        <div className="flex flex-col bg-base-100">
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
