import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { InferQueryOutput } from "@web/types/trpc";

type FindMyFavoritesQueryOutput =
  InferQueryOutput<"favorited-rooms.findMyFavorites">[number];

interface FavoritedRoomItemProps extends FindMyFavoritesQueryOutput {
  handleToggleFavorite: (id: string) => any;
}

export default function FavoritedRoomItem(props: FavoritedRoomItemProps) {
  return (
    <div key={props.id} className="flex gap-4">
      <div className="w-[100px]">
        {props.thumbnailUrl ? (
          <img
            src={props.thumbnailUrl}
            className="object-cover w-20 h-20"
            alt={props.name}
          />
        ) : (
          <div className="w-20 h-20 bg-info" />
        )}
      </div>
      <div className="flex flex-col justify-center flex-1">
        <div className="space-x-2">
          <Link href={`/rooms/${props.roomIdentificationId}`} passHref>
            <a className="inline text-xl no-underline link link-info">
              {props.name}
            </a>
          </Link>
          <span className="inline rounded-full badge badge-success badge-sm">
            {props.videoPlatform}
          </span>
          <span className="tooltip" data-tip="Remove to Favorites">
            <button
              aria-label={"Remote to favorites"}
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
