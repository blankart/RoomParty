import SignIn from "@web/components/SignIn/SignIn";
import { useMe } from "@web/context/AuthContext";
import { ComponentType } from "react";
import { FaSpinner } from "react-icons/fa";

export default function withSignIn<P extends Record<string, any>>(
  Component: ComponentType<P>
) {
  const NewComponent = ((props) => {
    const { hasUserInitialized, hasAccessToken, user, isIdle, isLoading } =
      useMe();

    if (hasUserInitialized && !hasAccessToken) {
      return (
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
      );
    }

    if (isIdle || isLoading) {
      return (
        <div className="flex items-center justify-center w-full min-h-screen mx-auto overflow-y-auto prose-sm md:prose max-w-none">
          <FaSpinner className="w-10 h-auto animate-spin" />
        </div>
      );
    }

    if (!isLoading && hasUserInitialized && !user) {
      return (
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
      );
    }

    return <Component {...props} />;
  }) as ComponentType<P>;

  NewComponent.displayName = `withSignIn${Component.displayName}`;

  return NewComponent;
}
