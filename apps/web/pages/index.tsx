import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import ClickableCard from "@web/components/Card/ClickableCard";
import Container from "@web/components/Container/Container";
import useMe from "@web/hooks/useMe";
import { useRouter } from "next/router";
import { AiOutlineLoading } from "react-icons/ai";

export default function Index() {
  const router = useRouter();
  const { user } = useMe();
  const { data: rooms, isLoading } = trpc.useQuery(["rooms.findMyRoom"], {
    enabled: !!user,
  });

  return (
    <Container className="flex flex-col items-center justify-center h-full gap-2 overflow-y-scroll">
      {!!user ? (
        <>
          {isLoading && (
            <AiOutlineLoading className="!w-20 h-auto animate-spin duration-100" />
          )}

          {!isLoading && (
            <>
              <h1>Available rooms:</h1>
              <div className="flex flex-wrap gap-4 max-h-[min(600px,100vh)] w-[min(1400px,100vw)] items-center justify-center">
                {rooms?.map((room) => (
                  <ClickableCard
                    href={"/rooms/[room]"}
                    as={`/rooms/${room.id}`}
                    shallow
                    className="basis-[300px]"
                    key={room.id}
                    imgSrc={room.thumbnail!}
                    alt={room.name}
                  >
                    <h2 className="text-left !m-0 text-[1rem] line-clamp-2">
                      {room.name}
                    </h2>
                    <p className="text-left !m-0">{room.online} online</p>
                  </ClickableCard>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <Button onClick={() => window.googleClient?.requestCode()}>
          Login via Google
        </Button>
      )}
    </Container>
  );
}
