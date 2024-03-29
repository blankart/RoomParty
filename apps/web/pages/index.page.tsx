import { Suspense } from "react";
import { BsPlayCircleFill } from "react-icons/bs";
import { NextSeo } from "next-seo";
import Image from "next/image";

import { APP_NAME } from "@RoomParty/shared-lib";

import thumbnail from "@web/public/images/thumbnail.png";
import UI from "@web/public/images/interface.png";

import ytIcon from "@web/public/images/yt-icon.png";
import twitchIcon from "@web/public/images/twitch-icon.svg";
import fbIcon from "@web/public/images/fb-icon.svg";
import vimeoIcon from "@web/public/images/vimeo-icon.svg";
import mixcloudIcon from "@web/public/images/mixcloud-icon.png";
import soundCloudIcon from "@web/public/images/soundcloud-icon.png";

import CreateARoomCard from "./components/CreateARoomCard";
import JoinARoomCard from "./components/JoinARoomCard";
import FavoritedRoom from "./components/FavoritedRoom";

export default function IndexPage() {
  const title = `${APP_NAME} - Watch Videos with your Friends`;
  const description =
    "RoomParty lets you watch Youtube, Twitch, Facebook videos and more synchronously with your friends with added features that allows you to chat and video with them throughout the whole experience.";
  const canonical = process.env.NEXT_PUBLIC_WEB_BASE_URL;
  return (
    <>
      <NextSeo
        title={title}
        canonical={canonical}
        description={description}
        openGraph={{
          title,
          description,
          url: canonical,
          images: [{ url: thumbnail.src }],
        }}
      />
      <video
        className="fixed inset-0 w-full opacity-40 dark:opacity-10 blur-lg !m-0 h-full object-cover z-[-2]"
        autoPlay
        loop
        muted
        preload="none"
      >
        <source src="/images/bg.mp4" type="video/mp4" />
      </video>
      <div className="container block w-full overflow-y-auto prose max-w-none">
        <div className="mt-10 hero">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <div className="max-w-[min(600px)] p-4 text-left">
                <h1 className="text-3xl font-bold md:text-4xl xl:text-5xl">
                  <BsPlayCircleFill className="inline mr-4" />
                  Watch with Friends
                </h1>
                <h2 className="text-sm text-left md:text-2xl xl:text-3xl">
                  You can now watch videos together with your friends!
                </h2>
                <p className="text-sm text-left md:text-xl xl:text-xl">
                  {description}
                </p>
                <a
                  className="w-full no-underline btn btn-info"
                  href="#create-a-room"
                >
                  <BsPlayCircleFill className="inline mr-4" />
                  Create a room
                </a>
                <h2 className="text-sm text-left uppercase md:text-md xl:text-lg">
                  Watch from your favorite streaming platforms
                </h2>
                <div className="flex flex-wrap items-center justify-center p-4 shadow-xl gap-x-4 xl:gap-x-5 gap-y-2 xl:gap-y-5 rounded-2xl dark:shadow-none">
                  <div
                    className="w-[130px] xl:w-[170px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="Youtube"
                  >
                    <Image
                      loading="lazy"
                      alt="Youtube"
                      src={ytIcon.src}
                      width={300}
                      height={90}
                      layout={"responsive"}
                    />
                  </div>

                  <div
                    className="w-[90px] xl:w-[130px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="Twitch"
                  >
                    <Image
                      loading="lazy"
                      alt="Twitch"
                      src={twitchIcon.src}
                      width={300}
                      height={220}
                      layout={"responsive"}
                    />
                  </div>
                  <div
                    className="w-[100px] xl:w-[180px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="Facebook"
                  >
                    <Image
                      loading="lazy"
                      alt="Facebook"
                      src={fbIcon.src}
                      width={300}
                      height={120}
                      layout={"responsive"}
                    />
                  </div>
                  <div
                    className="w-[100px] xl:w-[140px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="Vimeo"
                  >
                    <Image
                      loading="lazy"
                      alt="Vimeo"
                      src={vimeoIcon.src}
                      width={300}
                      height={100}
                      layout={"responsive"}
                    />
                  </div>
                  <div
                    className="w-[100px] xl:w-[180px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="Mixcloud"
                  >
                    <Image
                      loading="lazy"
                      alt="Mixcloud"
                      src={mixcloudIcon.src}
                      width={350}
                      height={80}
                      layout={"responsive"}
                    />
                  </div>
                  <div
                    className="w-[100px] xl:w-[130px] h-auto tooltip tooltip-info tooltip-top"
                    data-tip="SoundCloud"
                  >
                    <Image
                      loading="lazy"
                      alt="SoundCloud"
                      src={soundCloudIcon.src}
                      width={320}
                      height={180}
                      layout={"responsive"}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center w-full mx-auto">
              <div className="aspect-[16/12] w-full">
                <Image
                  loading="lazy"
                  alt="RoomParty User Interface"
                  src={UI.src}
                  width={200}
                  height={120}
                  layout="responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="bg-info px-4 py-10 mt-10 w-[100%] xl:mt-[150px]">
          <h1 className="text-2xl text-center lg:text-4xl">
            Create your first <b>RoomParty</b> room
          </h1>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <Suspense>
              <CreateARoomCard />
              <div className="divider md:divider-horizontal">OR</div>
              <JoinARoomCard />
            </Suspense>
          </div>
        </section>

        <FavoritedRoom />
      </div>
    </>
  );
}
