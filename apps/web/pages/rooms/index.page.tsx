import { NextSeo } from "next-seo";

import { APP_NAME } from "@RoomParty/shared-lib";

import Rooms from "./components/Rooms";
import thumbnail from "@web/public/images/thumbnail.png";

export default function RoomsPage() {
  const title = `My Rooms | ${APP_NAME}`;
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
      <Rooms />
    </>
  );
}
