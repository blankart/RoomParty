import type { PlayerStatus } from "@rooms2watch/trpc";
import { createTRPCClient, trpc } from "@web/api";
import Chat from "@web/components/Chat/Chat";
import YoutubePlayerWithControls from "@web/components/YoutubePlayer/YoutubePlayerWithControls";
import { useRoomsStore } from "@web/store/rooms";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { Suspense, useEffect } from "react";
import shallow from "zustand/shallow";
import type { User } from "@rooms2watch/prisma-client";
import Error from "next/error";
import { useMe } from "@web/context/AuthContext";
import { useRouter } from "next/router";

export default function Room() {
  const { set, id } = useRoomsStore(
    (s) => ({
      set: s.set,
      id: s.id,
    }),
    shallow
  );
  const router = useRouter();
  const roomId = router.query.room as string;
  const {
    user,
    isLoading: isUserLoading,
    isIdle,
    hasUserInitialized,
  } = useMe();
  const {
    data: room,
    isLoading,
    error,
  } = trpc.useQuery(["rooms.findById", roomId!], {
    enabled: !!roomId && router.isReady,
  });

  useEffect(() => {
    if (!room) return;
    const playerStatus = room.playerStatus as PlayerStatus | undefined;
    set({
      id: room.id,
      name: room.name,
      chats: room.chats,
      scrubTime: playerStatus?.time,
      url: playerStatus?.url,
      type: playerStatus?.type,
      userName: user?.user?.name ?? "",
      thumbnail: playerStatus?.thumbnail,
      owner: room.owner?.userId,
    });
  }, [room, user]);

  if (isLoading || isUserLoading || !hasUserInitialized) {
    return null;
  }

  if (!roomId && !isLoading) {
    return <Error statusCode={404} />;
  }

  if (error) {
    return <Error statusCode={404} />;
  }

  return (
    <div className="flex flex-col w-full h-screen prose lg:flex-row max-w-none">
      {!!id ? (
        <>
          <Suspense>
            <YoutubePlayerWithControls />
            <Chat />
          </Suspense>
        </>
      ) : null}
    </div>
  );
}
