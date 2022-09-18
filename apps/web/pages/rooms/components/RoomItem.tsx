import Link from "next/link";
import { IoMdMore } from "react-icons/io";

import { InferQueryOutput } from "@web/types/trpc";

export type FindMyRoomQueryOutput =
  InferQueryOutput<"rooms.findMyRoom">[number];

interface RoomItemProps extends FindMyRoomQueryOutput {
  handleDelete: (id: string) => any;
}

export default function RoomItem(props: RoomItemProps) {
  return (
    <div className="overflow-visible no-underline duration-100 rounded-none card w-96 bg-base-100 basis-[400px]">
      <figure className="!m-0">
        {props.thumbnail ? (
          <img
            src={props.thumbnail}
            className="!m-0 !p-0 w-full object-cover h-[150px]"
            alt={props.name}
          />
        ) : (
          <div className="!m-0 !p-0 w-full object-cover bg-primary h-[150px]" />
        )}
      </figure>
      <div className="card-body">
        <div className="space-x-2">
          <Link href={`/rooms/${props.roomIdentificationId}`} passHref>
            <a className="inline card-title !m-0">{props.name}</a>
          </Link>
          <span className="inline rounded-full badge badge-success badge-sm">
            {props.videoPlatform}
          </span>
        </div>
        <p className="!m-0">{props.online} online users</p>

        <div className="flex justify-end gap-4 card-actions">
          <div className="dropdown dropdown-left">
            <div
              tabIndex={0}
              className="tooltip tooltip-primary"
              data-tip="More Options"
            >
              <button className="rounded-full btn btn-sm btn-ghost">
                <IoMdMore className="w-6 h-auto" />
              </button>
            </div>
            <ul
              tabIndex={0}
              className="!p-0 !m-0 mt-3 list-none shadow-primary shadow-md bg-base-100 dropdown-content menu menu-compact"
            >
              <li className="p-0 m-0">
                <button
                  className="p-0 px-4 m-0 btn btn-outline btn-sm"
                  onClick={() => props.handleDelete(props.id)}
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
