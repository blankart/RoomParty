import Modal from "@web/components/Modal/Modal";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
const RoomSettings = dynamic(() => import("./RoomSettings"), { ssr: false });

interface ReactPlayerRoomSettingsProps {
  id?: string;
}

export default function ReactPlayerRoomSettings(
  props: ReactPlayerRoomSettingsProps
) {
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  return (
    <>
      <Modal
        open={showRoomSettings}
        onClose={() => setShowRoomSettings(false)}
        showCloseButton
        closeOnClickOutside
        title="Room Preferences"
      >
        <RoomSettings id={props.id} />
      </Modal>
      <div
        className="tooltip tooltip-secondary tooltip-left"
        data-tip="Room Settings"
      >
        <button
          aria-label="Room settings"
          className={classNames("btn btn-ghost btn-sm btn-circle")}
          onClick={() => setShowRoomSettings(true)}
        >
          <IoMdSettings className={classNames("w-4 h-auto")} />
        </button>
      </div>
    </>
  );
}
