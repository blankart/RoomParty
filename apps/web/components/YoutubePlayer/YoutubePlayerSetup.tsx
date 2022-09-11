import { AiFillYoutube } from "react-icons/ai";
import classNames from "classnames";
import Button from "../Button/Button";
import { useYoutubePlayerSetup } from "./useYoutubePlayerSetup";

export interface YoutubePlayerSetupProps {}

export default function YoutubePlayerSetup(props: YoutubePlayerSetupProps) {
  const ctx = useYoutubePlayerSetup(props);

  return (
    <div className="flex items-center justify-center w-full bg-slate-800">
      <div
        className={classNames(
          "rounded-lg border-solid border-slate-400 border-2 p-6 h-[400px] w-[300px] duration-100 hover:opacity-90 cursor-pointer flex flex-col items-center justify-center",
          {
            "border-red-500": ctx.focused,
          }
        )}
      >
        <AiFillYoutube
          className={classNames("w-[5rem] h-auto duration-100", {
            "text-red-500": ctx.focused,
          })}
        />
        <h2 className="text-[2rem] font-bold text-center uppercase">
          Watch from Youtube
        </h2>
        <input
          ref={ctx.youtubeInputRef}
          onFocus={() => ctx.setFocused(true)}
          onBlur={() => ctx.setFocused(false)}
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          className="w-full p-2 my-10 text-lg bg-slate-700/40"
        />

        <Button
          size="md"
          fullWidth
          className="duration-100 bg-transparent border-2 border-slate-400 hover:bg-slate-700 hover:border-slate-700"
          onClick={() => {
            if (!ctx.youtubeInputRef.current?.value) return;

            ctx.control({
              id: ctx.id!,
              statusObject: {
                sessionId: ctx.sessionId,
                time: 0,
                type: "CHANGE_URL",
                name: ctx.userName!,
                url: ctx.youtubeInputRef.current.value,
              },
            });
          }}
        >
          Watch
        </Button>
      </div>
    </div>
  );
}
