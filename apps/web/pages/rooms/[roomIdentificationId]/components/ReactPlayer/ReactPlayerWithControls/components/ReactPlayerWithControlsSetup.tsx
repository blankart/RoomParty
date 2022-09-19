import { AiFillYoutube, AiFillCloseCircle } from "react-icons/ai";
import classNames from "classnames";
import { FaSpinner } from "react-icons/fa";

import ClickableCard from "@web/components/Card/ClickableCard";

import { useReactPlayerWithControlsSetup } from "../hooks/useReactPlayerWithControlsSetup";

export interface ReactPlayerWithControlsSetupProps {}

export default function ReactPlayerWithControlsSetup(
  props: ReactPlayerWithControlsSetupProps
) {
  const ctx = useReactPlayerWithControlsSetup(props);

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
          className={classNames(
            "w-8 md:w-20 h-auto animate-spin duration-100",
            {
              "opacity-0 pointer-events-none":
                !ctx.showVideoSearch || !ctx.isLoading,
            }
          )}
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
        <div className="flex items-center w-full mb-10 md:block">
          <AiFillYoutube className="inline-block w-10 h-auto my-2 mr-2" />
          <input
            value={ctx.q}
            onChange={(e) => ctx.setQ(e.target.value)}
            className="input input-primary input-sm w-[min(600px,100%)] p-2 text-lg mx-auto"
          />
        </div>

        <button
          className="fixed md:absolute btn btn-ghost btn-sm top-2 right-2 btn-circle"
          onClick={() => ctx.setShowVideoSearch(false)}
        >
          <AiFillCloseCircle className="w-6 h-auto" />
        </button>

        {!ctx.isLoading && (
          <>
            {ctx.searchResult?.length ? (
              <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ctx.searchResult.map((result) => (
                  <ClickableCard
                    key={result.description + result.title}
                    onClick={() =>
                      ctx.onSelectLink(result.url, result.thumbnailSrc)
                    }
                    imgSrc={result.thumbnailSrc}
                    alt={result.title}
                  >
                    <h2 className="text-sm md:text-[1rem] text-start !m-0 line-clamp-2">
                      {result.title}
                    </h2>
                    <div className="flex justify-between w-full text-xs md:text-sm">
                      <p className="!m-0">{result.uploadedAt}</p>
                      <p className="!m-0">{result.views} views</p>
                    </div>
                  </ClickableCard>
                ))}
              </div>
            ) : (
              <>
                No results found for <i>{ctx.debouncedQ}</i>. Try another
                search.
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
