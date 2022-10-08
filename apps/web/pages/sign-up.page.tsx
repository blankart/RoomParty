import { APP_NAME } from "@RoomParty/shared-lib";
import SignUp from "@web/components/SignUp/SignUp";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

export default function SignUpPage() {
  const title = `Sign Up - ${APP_NAME}`;
  const canonical = process.env.NEXT_PUBLIC_WEB_BASE_URL + "/sign-up";
  const router = useRouter();

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
          <SignUp
            onSuccess={(res) => {
              router.push(
                `/verification-code?${new URLSearchParams({ accountId: res })}`
              );
            }}
          />
        </div>
      </div>
    </>
  );
}
