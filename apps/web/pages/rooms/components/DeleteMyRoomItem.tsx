import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";

import { FindMyRoomQueryOutput } from "./RoomItem";

interface DeleteMyRoomItemProps extends FindMyRoomQueryOutput {
  isDeleteMyRoomLoading: boolean;
  deleteRoom: (...args: any[]) => any;
}

export default function DeleteMyRoomItem(props: DeleteMyRoomItemProps) {
  return (
    <div className="flex justify-center card-actions">
      <div className="flex w-full gap-4 mb-4">
        <div className="w-[100px]">
          {props.thumbnail ? (
            <img src={props.thumbnail} className="object-cover w-20 h-20" />
          ) : (
            <div className="w-20 h-20 bg-secondary" />
          )}
        </div>
        <div className="flex flex-col justify-center flex-1">
          <div className="text-xl no-underline text-secondary">
            {props.name}
          </div>
          <p className="!m-0">{props.online} online users</p>
        </div>
      </div>
      <button
        className={classNames("w-full btn btn-error", {
          "btn-disabled": props.isDeleteMyRoomLoading,
        })}
        onClick={props.deleteRoom}
      >
        Delete{" "}
        {props.isDeleteMyRoomLoading && (
          <FaSpinner className="mx-2 animate-spin" />
        )}
      </button>
    </div>
  );
}
