import {
  AiFillYoutube,
  AiFillCloseCircle,
  AiOutlineLoading,
} from "react-icons/ai";
import classNames from "classnames";
import Button from "../Button/Button";
import { useYoutubePlayerSetup } from "./useYoutubePlayerSetup";
import ClickableCard from "../Card/ClickableCard";

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
            "opacity-0 pointer-events-none":
              !ctx.showVideoSearch || !ctx.isLoading,
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
          <AiFillYoutube className="inline-block w-12 h-auto my-2 mr-2" />
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
            <ClickableCard
              key={result.id}
              onClick={() => ctx.onSelectLink(result.url, result.thumbnailSrc)}
              imgSrc={result.thumbnailSrc}
              alt={result.title}
            >
              <h2 className="text-[1rem] text-start !m-0 line-clamp-2">
                {result.title}
              </h2>
              <div className="flex justify-between w-full">
                <p className="!m-0 text-sm">{result.uploadedAt}</p>
                <p className="!m-0 text-sm">{result.views} views</p>
              </div>
            </ClickableCard>
          ))}
        </div>
      </div>
    </>
  );
}