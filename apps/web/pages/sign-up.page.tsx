import SignUp from "@web/components/SignUp/SignUp";
import { useRouter } from "next/router";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-center w-full min-h-screen overflow-y-auto prose-sm md:prose max-w-none">
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
