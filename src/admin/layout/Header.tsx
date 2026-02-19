import { type AuthUser } from "wasp/auth";
import DarkModeSwitcher from "../../client/components/DarkModeSwitcher";
import { cn } from "../../client/utils";
import { UserDropdown } from "../../user/UserDropdown";
import MessageButton from "../dashboards/messages/MessageButton";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
  user: AuthUser;
}) => {
  return (
    <header className="sticky top-0 z-10 flex w-full border-b border-cyan-300/15 bg-slate-950/80 shadow-lg shadow-black/30 backdrop-blur-md">
      <div className="flex grow items-center justify-between px-5 py-4 sm:justify-between sm:gap-5">
        <div className="hidden sm:block">
          <p className="text-xs tracking-[0.25em] text-cyan-300/80 uppercase">Control Syqon</p>
          <p className="text-sm text-slate-300">Operations, access, and product governance</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}

          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-slate-700 bg-slate-900 p-1.5 shadow-xs lg:hidden"
          >
            <span className="h-5.5 w-5.5 relative block cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={cn(
                    "bg-cyan-200 relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-0 duration-200 ease-in-out",
                    {
                      "w-full! delay-300": !props.sidebarOpen,
                    },
                  )}
                ></span>
                <span
                  className={cn(
                    "bg-cyan-200 relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-150 duration-200 ease-in-out",
                    {
                      "delay-400 w-full!": !props.sidebarOpen,
                    },
                  )}
                ></span>
                <span
                  className={cn(
                    "bg-cyan-200 relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-200 duration-200 ease-in-out",
                    {
                      "w-full! delay-500": !props.sidebarOpen,
                    },
                  )}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={cn(
                    "bg-cyan-200 absolute left-2.5 top-0 block h-full w-0.5 rounded-sm delay-300 duration-200 ease-in-out",
                    {
                      "h-0! delay-0!": !props.sidebarOpen,
                    },
                  )}
                ></span>
                <span
                  className={cn(
                    "delay-400 bg-cyan-200 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm duration-200 ease-in-out",
                    {
                      "h-0! delay-200!": !props.sidebarOpen,
                    },
                  )}
                ></span>
              </span>
            </span>
          </button>

          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <ul className="2xsm:gap-4 flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
          {/* <!-- Dark Mode Toggler --> */}
          <DarkModeSwitcher />
          {/* <!-- Dark Mode Toggler --> */}

          {/* <!-- Chat Notification Area --> */}
          <MessageButton />
          {/* <!-- Chat Notification Area --> */}
        </ul>

        <div className="2xsm:gap-7 flex items-center gap-3">
          {/* <!-- User Area --> */}
          <UserDropdown user={props.user} />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
