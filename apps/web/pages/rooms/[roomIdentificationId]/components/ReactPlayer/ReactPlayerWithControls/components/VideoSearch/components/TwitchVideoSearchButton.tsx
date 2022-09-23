import classNames from "classnames";
import { memo } from "react";
import { FaTwitch } from "react-icons/fa";
import { VideoSearchProps } from "../types";

export default memo(function TwitchVideoSearchButton(props: VideoSearchProps) {
  return (
    <div className="tooltip tooltip-left" data-tip="Paste Twitch URL">
      <button
        className={classNames(
          "btn duration-100 btn-sm md:btn-md bg-blue-600 hover:bg-blue-600 border-none opacity-0",
          {
            "group-hover:opacity-100": !props.showVideoSearch,
          }
        )}
        onClick={props.onOpenModal}
      >
        <FaTwitch className="w-4 h-auto md:w-6" />
      </button>
    </div>
  );
});
