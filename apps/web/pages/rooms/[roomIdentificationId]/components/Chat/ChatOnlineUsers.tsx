import { CgMoreAlt } from "react-icons/cg";

interface ChatOnlineUsersProps {}

export default function ChatOnlineUsers(props: ChatOnlineUsersProps) {
  return (
    <div
      className="tooltip tooltip-right tooltip-primary"
      data-tip="99 users in this room"
    >
      <button className="inline-block -space-x-3 align-middle avatar-group">
        {Array(2).fill(
          <div className="avatar">
            <div className="w-6 h-6">
              <img
                src="https://placeimg.com/192/192/people"
                className="!m-0 w-6 h-6"
              />
            </div>
          </div>
        )}

        <div className="avatar placeholder">
          <div className="w-6 h-6 text-xs bg-neutral-focus text-neutral-content">
            <CgMoreAlt className="w-6 h-6 bg-neutral-focus" />
          </div>
        </div>
      </button>
    </div>
  );
}
