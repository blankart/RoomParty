import classNames from "classnames";
import { FaYoutube } from "react-icons/fa";
import { memo } from "react";
import { VideoSearchProps } from "../types";

export default memo(function YoutubeVideoSearchButton(props: VideoSearchProps) {
  return (
    <>
      <div className="tooltip tooltip-left" data-tip="Search on Youtube">
        <button
          className={classNames(
            "btn duration-100 btn-sm md:btn-md bg-red-600 hover:bg-red-600 border-none opacity-0",
            {
              "group-hover:opacity-100": !props.showVideoSearch,
            }
          )}
          onClick={props.onOpenModal}
        >
          <FaYoutube className="w-4 h-auto md:w-6" />
        </button>
      </div>
    </>
  );
});
