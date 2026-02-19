import { type AuthUser } from "wasp/auth";
import Breadcrumb from "../../layout/Breadcrumb";
import DefaultLayout from "../../layout/DefaultLayout";
import UsersTable from "./UsersTable";

const Users = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-cyan-300/20 bg-slate-950/70 p-6 shadow-xl shadow-cyan-950/25">
          <p className="text-xs tracking-[0.26em] text-cyan-300 uppercase">Role Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">Access & Permissions</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Assign roles and enforce access policy for the Syqon control ecosystem.
          </p>
        </section>
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default Users;
