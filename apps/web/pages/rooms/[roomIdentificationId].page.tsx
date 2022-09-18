import type { PlayerStatus } from "@rooms2watch/trpc";
import { trpc } from "@web/api";
import Chat from "@web/components/Chat/Chat";
import YoutubePlayerWithControls from "@web/components/YoutubePlayer/YoutubePlayerWithControls";
import { useRoomsStore } from "@web/store/rooms";
import { Suspense, useEffect } from "react";
import shallow from "zustand/shallow";
import Error from "next/error";
import { useMe } from "@web/context/AuthContext";
import { useRouter } from "next/router";
import { DARK_THEME } from "@web/components/DashboardLayout/DashboardLayout";

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
            <YoutubePlayerWithControls />
            <Chat />
          </Suspense>
        </>
      ) : null}
    </div>
  );
}

(RoomPage as any).forcedTheme = DARK_THEME;
