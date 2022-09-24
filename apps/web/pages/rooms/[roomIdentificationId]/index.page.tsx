import { Suspense, useEffect } from "react";
import shallow from "zustand/shallow";
import Error from "next/error";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

import type { PlayerStatus } from "@rooms2watch/trpc";
import { APP_NAME } from "@rooms2watch/shared-lib";

import { trpc } from "@web/api";
import Chat from "@web/pages/rooms/[roomIdentificationId]/components/Chat/Chat";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import { useMe } from "@web/context/AuthContext";
import { DARK_THEME } from "@web/components/DashboardLayout/DashboardLayout";
import { ReactPlayerProvider } from "./components/ReactPlayer/context/ReactPlayerContext";
import ReactPlayerWithControls2 from "./components/ReactPlayer/ReactPlayerWithControls/ReactPlayerWithControls2";
import { RoomProvider, useRoomContext } from "./context/RoomContext";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import thumbnail from "@web/public/images/thumbnail.png";
import { useRef } from "react";
import type ReactPlayer from "react-player";

function RoomIdentificationId() {
  const { set, id } = useRoomsStore(
    (s) => ({
      set: s.set,
      id: s.id,
    }),
    shallow
  );
  const { password } = useRoomContext();
  const router = useRouter();
  const roomIdentificationId = router.query.roomIdentificationId as string;
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const { user, isLoading: isUserLoading, hasUserInitialized } = useMe();
  const {
    data: room,
    isLoading,
    error,
    isIdle,
  } = trpc.useQuery(
    [
      "rooms.findByRoomIdentificationId",
      { roomIdentificationId, password: password ?? "" },
    ],
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
      scrubTime: playerStatus?.time,
      type: playerStatus?.type,
      thumbnail: playerStatus?.thumbnail,
      chats: room.chats,
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
            <ReactPlayerProvider reactPlayerRef={reactPlayerRef}>
              <ReactPlayerWithControls2 />
            </ReactPlayerProvider>
            <Chat />
          </Suspense>
        </>
      ) : null}
    </div>
  );
}

export default function RoomIdentificationIdPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const title = `Join my ${APP_NAME} room!`;
  const canonical = `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/rooms/${props.roomIdentificationId}`;
  const description =
    "If you have someone you want to watch a movie with, but everyone's busy, this is the perfect solution. You'll be able to watch movies together with your friends at home whenever you want!";

  return (
    <>
      <NextSeo
        title={title}
        canonical={canonical}
        description={description}
        openGraph={{
          title,
          description,
          url: canonical,
          images: [{ url: thumbnail.src }],
        }}
      />
      <RoomProvider>
        <RoomIdentificationId />
      </RoomProvider>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      roomIdentificationId: ctx.params?.roomIdentificationId as string,
    },
  };
}

(RoomIdentificationIdPage as any).forcedTheme = DARK_THEME;
