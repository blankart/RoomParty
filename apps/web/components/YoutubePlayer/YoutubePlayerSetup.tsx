import { AiFillYoutube, AiFillCloseCircle } from "react-icons/ai";
import classNames from "classnames";
import { useYoutubePlayerSetup } from "./useYoutubePlayerSetup";
import ClickableCard from "../Card/ClickableCard";
import { FaSpinner } from "react-icons/fa";

export interface YoutubePlayerSetupProps {}

export default function YoutubePlayerSetup(props: YoutubePlayerSetupProps) {
  const ctx = useYoutubePlayerSetup(props);

  return (
    <>
      <button
        className={classNames(
          "btn btn-info btn-xs rounded-full absolute z-10 bottom-12 right-4 duration-100",
          {
            "opacity-0 pointer-events-none": ctx.showVideoSearch,
          }
        )}
        onClick={() => ctx.setShowVideoSearch(true)}
      >
        Change Video
      </button>

      <div
        className={classNames(
          "!w-20 h-auto absolute z-10 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center gap-4",
          {
            "pointer-events-none": !ctx.isLoading,
          }
        )}
      >
        <FaSpinner
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
          "absolute inset-0 w-full p-10 overflow-y-auto bg-base-100/90 duration-100",
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
            className="input input-primary input-sm w-[min(600px,100%)] p-2 mb-10 text-lg mx-auto"
          />
        </div>

        <button
          className="absolute btn btn-ghost top-10 right-10"
          onClick={() => ctx.setShowVideoSearch(false)}
        >
          <AiFillCloseCircle className="w-6 h-auto" />
        </button>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
