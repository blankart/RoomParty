import type { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@rooms2watch/trpc";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

type FindMyFavoritesResponse = inferProcedureOutput<
  AppRouter["_def"]["queries"]["favorited-rooms.findMyFavorites"]
>[number];

interface FavoritedRoomItemProps extends FindMyFavoritesResponse {
  handleToggleFavorite: (id: string) => any;
}

export default function FavoritedRoomItem(props: FavoritedRoomItemProps) {
  return (
    <div key={props.id} className="flex gap-4">
      <div className="w-[100px]">
        {props.thumbnailUrl ? (
          <img src={props.thumbnailUrl} className="object-cover w-20 h-20" />
        ) : (
          <div className="w-20 h-20 bg-secondary" />
        )}
      </div>
      <div className="flex flex-col justify-center flex-1">
        <div className="space-x-2">
          <Link href={`/rooms/${props.roomIdentificationId}`} passHref>
            <a className="inline text-xl no-underline link link-secondary">
              {props.name}
            </a>
          </Link>
          <span className="inline rounded-full badge badge-success badge-sm">
            {props.videoPlatform}
          </span>
          <span className="tooltip" data-tip="Remove to Favorites">
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={() => props.handleToggleFavorite(props.id)}
            >
              <FaStar className="text-amber-500" />
            </button>
          </span>
        </div>
        <p className="!m-0">{props.online} online users</p>
      </div>
    </div>
  );
}
