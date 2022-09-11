import { PlayerStatus } from "trpc";
import { createTRPCClient } from "@web/api";
import Chat from "@web/components/Chat/Chat";
import Container from "@web/components/Container/Container";
import YoutubePlayerWithControls from "@web/components/YoutubePlayer/YoutubePlayerWithControls";
import { useRoomsStore } from "@web/store/rooms";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useEffect } from "react";
import shallow from "zustand/shallow";

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
    });
  }, []);

  return (
    <Container className="flex">
      {!!id ? (
        <>
          <YoutubePlayerWithControls />
          <Chat />
        </>
      ) : null}
    </Container>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const room = ctx.params?.room as string | undefined;
  if (!room) return { notFound: true, props: {} };

  try {
    const res = await createTRPCClient().query("rooms.findById", room);
    return {
      props: {
        id: res.id,
        name: res.name,
        chats: res.chats,
        playerStatus: res.playerStatus as PlayerStatus,
      },
    };
  } catch (e) {
    return {
      notFound: true,
      props: {},
    };
  }
}
