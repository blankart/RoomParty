import { trpc } from "@web/api";
import VerificationCode from "@web/components/VerificationCode/VerificationCode";
import { useMe } from "@web/context/AuthContext";
import Error from "next/error";
import { useRouter } from "next/router";
import { FaSpinner } from "react-icons/fa";

export default function VerificationCodePage() {
  const router = useRouter();
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
      <div className="flex items-center justify-center w-full min-h-screen overflow-y-auto prose max-w-none">
        <FaSpinner className="w-10 h-auto animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen overflow-y-auto prose-sm md:prose max-w-none">
      <div className="w-[min(500px,100%)] rounded-lg shadow-xl p-8 m-2">
        <VerificationCode
          onSuccess={(res) => {
            (
              window as any
            ).location = `/api/oauth/callback?${new URLSearchParams({
              access_token: res,
              redirect: "/me",
            })}`;
          }}
          verificationDetails={data!}
        />
      </div>
    </div>
  );
}
