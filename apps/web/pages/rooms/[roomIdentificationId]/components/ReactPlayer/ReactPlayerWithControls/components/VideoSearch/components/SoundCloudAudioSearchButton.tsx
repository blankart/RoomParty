import classNames from "classnames";
import { memo } from "react";
import { FaSoundcloud } from "react-icons/fa";
import { VideoSearchProps } from "../types";

export default memo(function SoundCloudAudioSearchButton(
  props: VideoSearchProps
) {
  return (
    <>
      <div className="tooltip tooltip-left" data-tip="Paste SoundCloud URL">
        <button
          className={classNames(
            "btn duration-100 btn-sm md:btn-md bg-orange-600 hover:bg-orange-600 border-none opacity-0",
            {
              "group-hover:opacity-100": !props.showVideoSearch,
              "opacity-100": props.forceShow,
            }
          )}
          onClick={props.onOpenModal}
        >
          <FaSoundcloud className="w-4 h-auto md:w-6" />
        </button>
      </div>
    </>
  );
});
