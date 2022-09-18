import { Suspense } from "react";
import { BsPlayCircleFill } from "react-icons/bs";

import CreateARoomCard from "./components/CreateARoomCard";
import JoinARoomCard from "./components/JoinARoomCard";
import FavoritedRoom from "./components/FavoritedRoom";

export default function Index() {
  return (
    <div className="block w-full h-screen overflow-y-auto prose max-w-none">
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
  );
}
