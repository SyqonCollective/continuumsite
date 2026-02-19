import { FC, ReactNode, useState } from "react";
import { Navigate } from "react-router";
import { type AuthUser } from "wasp/auth";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface Props {
  user: AuthUser;
  children?: ReactNode;
}

const DefaultLayout: FC<Props> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasAdminPrivileges =
    user.isAdmin || user.role === "ADMIN" || user.role === "OWNER";

  if (!hasAdminPrivileges) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="text-foreground relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.18),transparent_45%)]" />
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative z-10 flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
          <main>
            <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6 2xl:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
