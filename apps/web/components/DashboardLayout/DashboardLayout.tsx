import { BsPlayCircleFill } from "react-icons/bs";
import { FaGoogle, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";

import { ACCESS_TOKEN_KEY } from "@rooms2watch/common-types";
import { trpc } from "@web/api";
import { useMe } from "@web/context/AuthContext";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  const { user, isLoading, handleSignout } = useMe();
  const router = useRouter();

  if (router.asPath.match(/\/rooms\/.*/)) {
    return <>{props.children}</>;
  }
  return (
    <div className="flex flex-col w-full h-screen overflow-y-auto prose max-w-none">
      <div className="p-4 navbar bg-base-100">
        <div className="navbar-start">
          {!!user && (
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/">
                    <a className="link">rooms2watch</a>
                  </Link>
                </li>
                <li>
                  <Link href="/rooms">
                    <a className="link">My rooms</a>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="navbar-center">
          <a className="text-xl normal-case btn btn-ghost">
            <BsPlayCircleFill className="inline mr-2" />
            rooms2watch
          </a>
        </div>
        <div className="navbar-end">
          {isLoading ? (
            <>
              <div className="avatar">
                <FaSpinner className="w-8 h-auto animate-spin" />
              </div>
            </>
          ) : (
            <>
              {!!user ? (
                <>
                  <div className="dropdown dropdown-left">
                    <label
                      tabIndex={0}
                      className="tooltip tooltip-left tooltip-primary"
                      data-tip={user?.user?.name}
                    >
                      <button className="avatar online">
                        <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img src={user?.user?.picture!} className="!m-0" />
                        </div>
                      </button>
                    </label>
                    <ul
                      tabIndex={0}
                      className="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button className="text-sm" onClick={handleSignout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <button
                  className="btn btn-circle btn-outline"
                  onClick={() => {
                    (window as any).location =
                      process.env.NEXT_PUBLIC_SERVER_URL +
                      "/oauth2/redirect/google";
                  }}
                >
                  <FaGoogle />
                </button>
              )}
            </>
          )}

          {/* <button className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button> */}
        </div>
      </div>
      <>{props.children}</>
    </div>
  );
}
