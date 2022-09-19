import { Suspense, useEffect } from "react";
import shallow from "zustand/shallow";
import Error from "next/error";
import { useRouter } from "next/router";

import type { PlayerStatus } from "@rooms2watch/trpc";

import { trpc } from "@web/api";
import Chat from "@web/pages/rooms/[roomIdentificationId]/components/Chat/Chat";
import ReactPlayerWithControls from "@web/pages/rooms/[roomIdentificationId]/components/ReactPlayer/ReactPlayerWithControls/ReactPlayerWithControls";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import { useMe } from "@web/context/AuthContext";
import { DARK_THEME } from "@web/components/DashboardLayout/DashboardLayout";
import { ReactPlayerProvider } from "./components/ReactPlayer/ReactPlayerWithControls/context/ReactPlayerWithControlsContext";

export default function RoomPage() {
  const { set, id } = useRoomsStore(
    (s) => ({
      set: s.set,
      id: s.id,
    }),
    shallow
  );
  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as string;
  const { user, isLoading: isUserLoading, hasUserInitialized } = useMe();
  const {
    data: room,
    isLoading,
    error,
    isIdle,
  } = trpc.useQuery(
    ["rooms.findByRoomIdentificationId", { roomIdentificationId }],
    {
      enabled: !!roomIdentificationId && router.isReady,
    }
  );

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
      videoPlatform: room.videoPlatform,
      ownerName: room.owner?.user.name,
    });
  }, [room, user]);

  if (isLoading || isUserLoading || !hasUserInitialized || isIdle) {
    return null;
  }

  if (!roomIdentificationId && !isLoading) {
    return <Error statusCode={404} />;
  }

  if (error) {
    return <Error statusCode={404} />;
  }

  return (
    <div className="absolute inset-0 flex flex-col prose lg:flex-row max-w-none">
      {!!id ? (
        <>
          <Suspense>
            <ReactPlayerProvider>
              <ReactPlayerWithControls />
            </ReactPlayerProvider>
            <Chat />
          </Suspense>
        </>
      ) : null}
    </div>
  );
}

(RoomPage as any).forcedTheme = DARK_THEME;
