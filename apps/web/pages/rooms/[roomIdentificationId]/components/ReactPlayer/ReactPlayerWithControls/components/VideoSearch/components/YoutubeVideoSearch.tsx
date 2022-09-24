import { AiFillYoutube, AiFillCloseCircle } from "react-icons/ai";
import classNames from "classnames";
import { FaSpinner, FaYoutube } from "react-icons/fa";

import ClickableCard from "@web/components/Card/ClickableCard";

import { useYoutubeVideoSearch } from "../../../hooks/useYoutubeVideoSearch";
import { memo, useEffect, useRef } from "react";
import { VideoSearchProps } from "../types";
import Input from "@web/components/Input/Input";

export default memo(function YoutubeVideoSearch(props: VideoSearchProps) {
  const ctx = useYoutubeVideoSearch(props);

  const modalRef = useRef<HTMLDivElement>(null);
  const modalRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (e.target === modalRef.current || e.target === modalRef2.current)
        props.onCloseModal();
    }

    window.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <>
      <div
        ref={modalRef2}
        className={classNames(
          "!w-20 h-auto absolute z-[11] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center gap-4",
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
                !props.showVideoSearch || !ctx.isLoading,
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
        ref={modalRef}
        className={classNames(
          "absolute inset-0 w-full z-[10] p-10 overflow-y-auto bg-base-100/90 duration-100",
          {
            "opacity-0 pointer-events-none": !props.showVideoSearch,
          }
        )}
      >
        <div className="h-full w-[min(1200px,100%)] mx-auto">
          <Input
            value={ctx.q}
            onChange={(e) => ctx.setQ(e.target.value)}
            className="input-sm md:input-md"
            label={
              <>
                Type a keyword or <FaYoutube className="inline-block" /> Youtube
                URL
              </>
            }
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />

          <button
            className="fixed md:absolute btn btn-ghost btn-sm top-2 right-2 btn-circle"
            onClick={props.onCloseModal}
          >
            <AiFillCloseCircle className="w-6 h-auto" />
          </button>

          {!ctx.isLoading && (
            <>
              {ctx.searchResult?.length ? (
                <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {ctx.searchResult.map((result) => (
                    <ClickableCard
                      key={result.description + result.title + result.id}
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
      </div>
    </>
  );
});
