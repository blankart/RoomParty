import { trpc } from "@web/api";
import useDebouncedEffect from "@web/hooks/useDebouncedEffect";
import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { useRoomContext } from "../../context/RoomContext";
import { useRoomsStore } from "../../store/rooms";

interface ChatOnlineUsersProps {}

export default memo(function ChatOnlineUsers(props: ChatOnlineUsersProps) {
  const router = useRouter();
  const { password } = useRoomContext();
  const roomIdentificationId = router.query.roomIdentificationId as string;
  const { data, refetch } = trpc.useQuery(
    ["rooms.getOnlineInfo", { roomIdentificationId, password: password ?? "" }],
    {
      enabled: !!roomIdentificationId,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }
  );

  // const chatLength = useRoomsStore((s) => s.chatsLength());
  const temporaryChatsLength = useRoomsStore((s) => s.temporaryChatsLength());

  useDebouncedEffect(
    () => {
      refetch();
    },
    // [chatLength],
    [temporaryChatsLength],
    5_000
  );

  const first3OnlineInfo = useMemo(
    () => data?.usersForDisplay?.slice(0, 3) ?? [],
    [data]
  );

  if (!first3OnlineInfo?.length) return null;

  return (
    <div
      className="tooltip tooltip-right tooltip-secondary"
      data-tip={`${data?.count} online user${
        (data?.count ?? 0) > 1 ? "s" : ""
      }`}
    >
      <button
        className="inline-block p-1 -space-x-3 align-middle avatar-group"
        aria-label="Online users"
      >
        {first3OnlineInfo.map((onlineInfo, i) => (
          <div
            className={classNames(
              "avatar !overflow-visible online",
              !onlineInfo.picture && "placeholder"
            )}
            key={i}
          >
            <div className="w-6 h-6">
              {onlineInfo.picture ? (
                <img
                  src={onlineInfo.picture}
                  className="!m-0 w-6 h-6 relative rounded-full"
                />
              ) : (
                <div className="!m-0 w-full h-full text-[.9rem] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-secondary rounded-full">
                  {onlineInfo.name?.substring(0, 1)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        ))}

        {(data?.count ?? 0) > 3 && (
          <div className="avatar placeholder">
            <div className="w-6 h-6 text-xs bg-neutral-focus text-neutral-content">
              <div className="!m-0 w-full h-full text-[.9rem] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-secondary rounded-full">
                +{data?.count ?? 0}
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
});
