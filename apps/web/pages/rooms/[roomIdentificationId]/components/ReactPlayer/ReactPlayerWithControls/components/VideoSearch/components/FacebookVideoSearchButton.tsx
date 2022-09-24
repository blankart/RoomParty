import classNames from "classnames";
import { FaFacebook } from "react-icons/fa";
import { memo } from "react";
import { VideoSearchProps } from "../types";

export default memo(function FacebookVideoSearchButton(
  props: VideoSearchProps
) {
  return (
    <>
      <div className="tooltip tooltip-left" data-tip="Paste Facebook URL">
        <button
          className={classNames(
            "btn duration-100 btn-sm md:btn-md bg-blue-400 hover:bg-blue-400 border-none opacity-0",
            {
              "group-hover:opacity-100": !props.showVideoSearch,
              "opacity-100": props.forceShow,
            }
          )}
          onClick={props.onOpenModal}
        >
          <FaFacebook className="w-4 h-auto md:w-6" />
        </button>
      </div>
    </>
  );
});
