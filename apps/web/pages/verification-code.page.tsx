import { APP_NAME } from "@RoomParty/shared-lib";
import { trpc } from "@web/trpc";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import Error from "next/error";
import { useRouter } from "next/router";
import { FaSpinner } from "react-icons/fa";

const VerificationCode = dynamic(
  () => import("@web/components/VerificationCode/VerificationCode")
);

export default function VerificationCodePage() {
  const router = useRouter();
  const title = `Verify your Email - ${APP_NAME}`;
  const canonical = process.env.NEXT_PUBLIC_WEB_BASE_URL + "/verification-code";
  const { isLoading, data, isIdle, error } = trpc.useQuery(
    [
      "users.getVerificationDetails",
      { accountId: router.query.accountId as string },
    ],
    {
      enabled: !!router.query.accountId && router.isReady,
    }
  );

  if ((!router.query.accountId && router.isReady) || error) {
    return <Error statusCode={401} />;
  }

  if (isIdle || (!data && isLoading)) {
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
          <FaSpinner className="w-10 h-auto animate-spin" />
        </div>
      </>
    );
  }

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
          <VerificationCode
            onSuccess={(res) => {
              (
                window as any
              ).location = `/api/oauth/callback?${new URLSearchParams({
                access_token: res,
                redirect: "/user-settings",
              })}`;
            }}
            verificationDetails={data!}
          />
        </div>
      </div>
    </>
  );
}
