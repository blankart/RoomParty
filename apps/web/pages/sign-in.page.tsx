import { APP_NAME } from "@RoomParty/shared-lib";
import SignIn from "@web/components/SignIn/SignIn";
import { NextSeo } from "next-seo";

export default function SignInPage() {
  const title = `Sign In - ${APP_NAME}`;
  const canonical = process.env.NEXT_PUBLIC_WEB_BASE_URL + "/sign-in";
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
      <div className="flex items-center justify-center w-full min-h-screen mx-auto overflow-y-auto prose-sm md:prose max-w-none">
        <div className="w-[min(500px,100%)] rounded-lg shadow-xl p-8 m-2">
          <SignIn
            onSuccess={(res) => {
              (
                window as any
              ).location = `/api/oauth/callback?${new URLSearchParams({
                access_token: res,
                redirect: "/",
              })}`;
            }}
          />
        </div>
      </div>
    </>
  );
}
