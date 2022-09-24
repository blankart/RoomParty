import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import { useRoomContext } from "@web/pages/rooms/[roomIdentificationId]/context/RoomContext";
import { useRoomsStore } from "@web/pages/rooms/[roomIdentificationId]/store/rooms";
import classNames from "classnames";
import { memo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import shallow from "zustand/shallow";
import { VideoSearchProps } from "../types";

export default memo(function FacebookVideoSearch(props: VideoSearchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ link: string }>({
    mode: "onSubmit",
  });

  const { mutateAsync: control } = trpc.useMutation(["player.control"]);

  const { id, tabSessionId } = useRoomsStore(
    (s) => ({
      id: s.id,
      tabSessionId: s.tabSessionId,
    }),
    shallow
  );

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

  const { userName } = useRoomContext();

  async function onSubmit(data: { link: string }) {
    await control({
      id: id!,
      statusObject: {
        tabSessionId: tabSessionId,
        name: userName!,
        type: "CHANGE_URL",
        time: 0,
        url: data.link,
        thumbnail: "",
      },
    });

    props.onCloseModal();
  }
  return (
    <>
      <div
        ref={modalRef2}
        className={classNames(
          "absolute inset-0 w-full z-[10] p-10 overflow-y-auto bg-base-100/90 duration-100",
          {
            "opacity-0 pointer-events-none": !props.showVideoSearch,
          }
        )}
      >
        <button
          className="fixed md:absolute btn btn-ghost btn-sm top-2 right-2 btn-circle"
          onClick={props.onCloseModal}
        >
          <AiFillCloseCircle className="w-6 h-auto" />
        </button>
        <div
          ref={modalRef}
          className="h-full w-[min(1200px,100%)] mx-auto flex flex-col items-center justify-center"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label={
                <>
                  Paste a <FaFacebook className="inline-block text-blue-400" />{" "}
                  <span className="text-blue-400">facebook</span> video link
                </>
              }
              placeholder="https://www.facebook.com/<PAGE_NAME>/videos/<VIDEO_ID>"
              {...register("link", {
                required: "Facebook video link is required",
                validate: (value) => {
                  if (
                    !value?.match(
                      /^https:\/\/(www\.)?facebook\.com\/(.*)\/videos\//
                    )
                  )
                    return "Please enter a valid video link";
                },
              })}
              error={errors?.link?.message}
            />
            <Button className="w-full btn-sm md:btn-md">Watch</Button>
          </form>
        </div>
      </div>
    </>
  );
});