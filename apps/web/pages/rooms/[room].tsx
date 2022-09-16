import type { PlayerStatus } from "@rooms2watch/trpc";
import { createTRPCClient } from "@web/api";
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

export default function Room(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { set, id } = useRoomsStore(
    (s) => ({
      set: s.set,
      id: s.id,
    }),
    shallow
  );

  useEffect(() => {
    set({
      id: props.id,
      name: props.name,
      chats: props.chats,
      scrubTime: props.playerStatus?.time,
      url: props.playerStatus?.url,
      type: props.playerStatus?.type,
      userName: props.userName,
      thumbnail: props.playerStatus?.thumbnail,
      owner: props.owner,
    });
  }, []);

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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const room = ctx.params?.room as string | undefined;
  if (!room) return { notFound: true, props: {} };

  try {
    const trpcClient = createTRPCClient(ctx);
    const res = await trpcClient.query("rooms.findById", room);
    let user: { id: string; user: User } | null | undefined;
    try {
      user = await trpcClient.query("users.me");
    } catch {}
    return {
      props: {
        id: res.id,
        name: res.name,
        chats: res.chats,
        playerStatus: res.playerStatus as PlayerStatus,
        owner: res.owner?.userId,
        createdAt: res.createdAt,
        userName: user?.user?.name ?? "",
      },
    };
  } catch (e) {
    return {
      notFound: true,
      props: {},
    };
  }
}
