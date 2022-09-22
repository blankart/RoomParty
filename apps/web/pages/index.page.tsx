import { Suspense } from "react";
import { BsPlayCircleFill } from "react-icons/bs";
import { NextSeo } from "next-seo";

import { APP_NAME } from "@rooms2watch/shared-lib";

import CreateARoomCard from "./components/CreateARoomCard";
import JoinARoomCard from "./components/JoinARoomCard";
import FavoritedRoom from "./components/FavoritedRoom";
import thumbnail from "@web/public/images/thumbnail.png";

export default function IndexPage() {
  const title = `${APP_NAME} - Watch Videos with your Friends`;
  const description =
    "If you have someone you want to watch a movie with, but everyone's busy, this is the perfect solution. You'll be able to watch movies together with your friends at home whenever you want!";
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
      <div className="block w-full overflow-y-auto prose max-w-none">
        <div className="hidden md:grid hero bg-base-100">
          <div className="text-center hero-content">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold md:text-5xl">
                <BsPlayCircleFill className="inline mr-4" />
                rooms2watch
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center w-[100vw] gap-4 mt-10 md:mt-[150px] md:flex-row items-center">
          <Suspense>
            <CreateARoomCard />
            <div className="divider md:divider-horizontal">OR</div>
            <JoinARoomCard />
          </Suspense>
        </div>

        <FavoritedRoom />
      </div>
    </>
  );
}
