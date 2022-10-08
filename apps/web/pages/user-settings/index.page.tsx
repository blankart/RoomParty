import { APP_NAME } from "@RoomParty/shared-lib";
import withSignIn from "@web/higher-order/withSignIn";
import { NextSeo } from "next-seo";

function UserSettingsPage() {
  const title = `User Settings - ${APP_NAME}`;
  const canonical = process.env.NEXT_PUBLIC_WEB_BASE_URL + "/user-settings";
  return (
    <>
      <NextSeo
        title={title}
        canonical={canonical}
        openGraph={{
          title,
          url: canonical,
        }}
      />
      <div className="w-full min-h-screen overflow-y-auto prose-sm md:prose max-w-[min(1200px,100%)] mx-auto">
        <div className="p-4">
          <h1>Users Settings</h1>
        </div>
      </div>
    </>
  );
}

export default withSignIn(UserSettingsPage);
