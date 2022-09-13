import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import ClickableCard from "@web/components/Card/ClickableCard";
import useMe from "@web/hooks/useMe";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();
  const { user } = useMe();
  const { data: rooms } = trpc.useQuery(["rooms.findMyRoom"], {
    enabled: !!user,
  });

  return (
    <div>
      {/* <Button
        onClick={() => {
          window.googleClient?.requestCode();
        }}
      >
        Sign in
      </Button> */}

      <div className="grid grid-cols-4 gap-4 overflow-y-auto">
        {rooms?.map((room) => (
          <ClickableCard
            key={room.id}
            imgSrc={room.thumbnail!}
            alt={room.name}
            onClick={() =>
              router.push("/rooms/[room]", `/rooms/${room.id}`, {
                shallow: true,
              })
            }
          >
            <h1>{room.name}</h1>
            <p>{room.online} online</p>
          </ClickableCard>
        ))}
      </div>
    </div>
  );
}
