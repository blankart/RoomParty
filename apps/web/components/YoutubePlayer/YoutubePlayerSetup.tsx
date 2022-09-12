import {
  AiFillYoutube,
  AiFillCloseCircle,
  AiOutlineLoading,
} from "react-icons/ai";
import classNames from "classnames";
import Button from "../Button/Button";
import { useYoutubePlayerSetup } from "./useYoutubePlayerSetup";

export interface YoutubePlayerSetupProps {}

export default function YoutubePlayerSetup(props: YoutubePlayerSetupProps) {
  const ctx = useYoutubePlayerSetup(props);

  return (
    <>
      <Button
        className={classNames("absolute z-10 bottom-12 right-4 duration-100", {
          "opacity-0 pointer-events-none": ctx.showVideoSearch,
        })}
        onClick={() => ctx.setShowVideoSearch(true)}
      >
        Change Video
      </Button>

      <div
        className={classNames(
          "!w-20 h-auto absolute z-10 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center gap-4",
          {
            "pointer-events-none": !ctx.isLoading,
          }
        )}
      >
        <AiOutlineLoading
          className={classNames("!w-20 h-auto animate-spin duration-100", {
            "opacity-0 pointer-events-none": !ctx.isLoading,
          })}
        />
        <span
          className={classNames(
            { "opacity-0": !ctx.isLoading },
            "text-center w-full"
          )}
        ></span>
      </div>

      <div
        className={classNames(
          "absolute inset-0 w-full p-10 overflow-y-auto bg-slate-900/95 duration-100",
          {
            "opacity-0 pointer-events-none": !ctx.showVideoSearch,
          }
        )}
      >
        <div className="w-full">
          <AiFillYoutube className="inline-block w-10 h-auto my-2 mr-2" />
          <input
            value={ctx.q}
            onChange={(e) => ctx.setQ(e.target.value)}
            className="w-[min(600px,100%)] p-2 mb-10 text-lg bg-slate-700/40 mx-auto"
          />
        </div>

        <button
          className="absolute top-10 right-10"
          onClick={() => ctx.setShowVideoSearch(false)}
        >
          <AiFillCloseCircle className="w-6 h-auto" />
        </button>

        <div className="grid grid-cols-4 gap-4 overflow-y-auto">
          {ctx.searchResult?.map((result) => (
            <button
              key={result.title}
              className="overflow-hidden rounded-lg bg-slate-700"
              onClick={() => ctx.onSelectLink(result.url)}
            >
              <img
                src={result.thumbnailSrc}
                alt={result.title}
                className="!m-0 aspect-video"
              />
              <div className="p-4">
                <h2 className="text-[1.2rem] text-start !m-0">
                  {result.title}
                </h2>
                <div className="flex justify-between w-full">
                  <p className="!m-0 text-sm">{result.uploadedAt}</p>
                  <p className="!m-0 text-sm">{result.views} views</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full aspect-video bg-slate-800">
        <div
          className={classNames(
            "rounded-lg border-solid border-slate-400 border-2 p-6 h-[30rem] w-[20rem] duration-100 hover:opacity-90 cursor-pointer flex flex-col items-center justify-center",
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
    </div>
  );
}
