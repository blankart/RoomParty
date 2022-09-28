import { BsMoon, BsPlayCircleFill, BsSun } from "react-icons/bs";
import { FaGoogle, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

import { useMe } from "@web/context/AuthContext";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const LIGHT_THEME = "cupcake";
export const DARK_THEME = "halloween";

export default function DashboardLayout(props: DashboardLayoutProps) {
  const { user, isLoading, handleSignout } = useMe();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (router.asPath.match(/\/rooms\/.*/)) {
    return <>{props.children}</>;
  }

  return (
    <div className="absolute inset-0 flex flex-col w-full overflow-y-auto prose max-w-none">
      <video
        className="fixed inset-0 w-full opacity-40 dark:opacity-10 blur-lg !m-0 h-full object-cover z-[-1]"
        autoPlay
        loop
        muted
        preload="none"
      >
        <source src="/images/bg.mp4" type="video/mp4" />
      </video>
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
                    <a className="link">partyfy</a>
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
          <Link href="/" passHref>
            <a className="text-xl normal-case btn btn-ghost">
              <BsPlayCircleFill className="inline mr-2" />
              partyfy
            </a>
          </Link>
        </div>
        <div className="navbar-end">
          <label className="p-4 swap swap-rotate">
            <input
              type="checkbox"
              className="hidden"
              checked={theme === DARK_THEME}
              onChange={() =>
                setTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
              }
            />

            <BsSun className="w-4 h-auto md:w-6 swap-on" />
            <BsMoon className="w-4 h-auto md:w-6 swap-off" />
          </label>
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
                      <button className="avatar online" aria-label="User Menu">
                        <div className="rounded-full w-7 md:w-10 ring ring-info ring-offset-base-100 ring-offset-2">
                          <img
                            src={user?.user?.picture!}
                            className="!m-0"
                            alt="User profile image"
                          />
                        </div>
                      </button>
                    </label>
                    <ul
                      tabIndex={0}
                      className="p-2 px-10 py-1 shadow dropdown-content menu bg-base-100 rounded-box"
                    >
                      <li>
                        <button
                          aria-label="Logout"
                          className="text-xs md:text-sm btn-xs md:btn-md"
                          onClick={handleSignout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <div
                  className="tooltip tooltip-left tooltip-primary"
                  data-tip="Login with Google"
                >
                  <button
                    aria-label="Login with Google"
                    className="btn btn-sm btn-circle btn-outline"
                    onClick={() => {
                      (window as any).location =
                        process.env.NEXT_PUBLIC_SERVER_URL +
                        "/oauth2/redirect/google";
                    }}
                  >
                    <FaGoogle />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="z-10">
        <>{props.children}</>
      </div>
      <footer className="bg-neutral">
        {/* <div className="container p-10 mx-auto footer">
          <div>
            <span className="text-white footer-title">Services</span>
            <a className="text-white link link-hover">Branding</a>
            <a className="text-white link link-hover">Design</a>
            <a className="text-white link link-hover">Marketing</a>
            <a className="text-white link link-hover">Advertisement</a>
          </div>
          <div>
            <span className="text-white footer-title">Company</span>
            <a className="text-white link link-hover">Branding</a>
            <a className="text-white link link-hover">Design</a>
            <a className="text-white link link-hover">Marketing</a>
            <a className="text-white link link-hover">Advertisement</a>
          </div>
          <div>
            <span className="text-white footer-title">Legal</span>
            <a className="text-white link link-hover">Branding</a>
            <a className="text-white link link-hover">Design</a>
            <a className="text-white link link-hover">Marketing</a>
            <a className="text-white link link-hover">Advertisement</a>
          </div>
        </div> */}
        <div className="container mx-auto">
          <p className="text-sm text-center md:text-md">
            Copyright © partyfy 2022
          </p>
        </div>
      </footer>
    </div>
  );
}
