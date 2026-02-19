import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "wasp/client/auth";
import {
  getPaginatedUsers,
  updateUserRoleById,
  useQuery,
} from "wasp/client/operations";
import { Button } from "../../../client/components/ui/button";
import { Checkbox } from "../../../client/components/ui/checkbox";
import { Input } from "../../../client/components/ui/input";
import { Label } from "../../../client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../client/components/ui/select";
import useDebounce from "../../../client/hooks/useDebounce";
import { SubscriptionStatus } from "../../../payment/plans";
import LoadingSpinner from "../../layout/LoadingSpinner";

const roleOptions = [
  "OWNER",
  "ADMIN",
  "EDITOR",
  "VIEWER",
] as const;
type UserRole = (typeof roleOptions)[number];

function RoleBadge({ role }: { role: UserRole }) {
  const palette =
    role === UserRole.OWNER
      ? "bg-amber-500/15 text-amber-300 border-amber-300/30"
      : role === UserRole.ADMIN
        ? "bg-sky-500/15 text-sky-300 border-sky-300/30"
        : role === UserRole.EDITOR
          ? "bg-violet-500/15 text-violet-300 border-violet-300/30"
          : "bg-zinc-500/15 text-zinc-300 border-zinc-300/30";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${palette}`}>
      {role}
    </span>
  );
}

function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: UserRole;
  disabled: boolean;
}) {
  return (
    <Select
      value={role}
      onValueChange={(value) =>
        updateUserRoleById({ id: userId, role: value as UserRole })
      }
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-34">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const UsersTable = () => {
  const { data: currentUser } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<UserRole[]>([]);
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<
    Array<SubscriptionStatus | null>
  >([]);

  const debouncedEmailFilter = useDebounce(emailFilter, 300);
  const skipPages = currentPage - 1;

  const { data, isLoading } = useQuery(getPaginatedUsers, {
    skipPages,
    filter: {
      ...(debouncedEmailFilter && { emailContains: debouncedEmailFilter }),
      ...(roleFilter.length > 0 && { roleIn: roleFilter }),
      ...(subscriptionStatusFilter.length > 0 && {
        subscriptionStatusIn: subscriptionStatusFilter,
      }),
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedEmailFilter, subscriptionStatusFilter, roleFilter]);

  const handleStatusToggle = (status: SubscriptionStatus | null) => {
    setSubscriptionStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const handleRoleToggle = (role: UserRole) => {
    setRoleFilter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const clearAllFilters = () => {
    setRoleFilter([]);
    setSubscriptionStatusFilter([]);
  };

  const hasActiveFilters =
    roleFilter.length > 0 || subscriptionStatusFilter.length > 0;

  const rows = data?.users ?? [];

  const userRoleSummary = useMemo(() => {
    const summary: Record<UserRole, number> = {
      OWNER: 0,
      ADMIN: 0,
      EDITOR: 0,
      VIEWER: 0,
    };
    rows.forEach((u) => {
      summary[u.role] += 1;
    });
    return summary;
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyan-300/20 bg-slate-950/70 p-4 shadow-lg shadow-cyan-950/25">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-widest text-cyan-300">ACCESS CONTROL</p>
            <h2 className="text-xl font-semibold text-slate-100">Users & Roles</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <span key={role} className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                {role}: {userRoleSummary[role]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="email-filter">Email contains</Label>
              <Input
                id="email-filter"
                placeholder="user@company.com"
                onChange={(e) => {
                  const value = e.currentTarget.value.trim();
                  setEmailFilter(value === "" ? undefined : value);
                }}
              />
            </div>

            <div className="space-y-1">
              <Label>Role filters</Label>
              <div className="flex flex-wrap gap-2 rounded-md border border-slate-700 bg-slate-900 p-2">
                {roleOptions.map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={roleFilter.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Subscription status</Label>
              <div className="flex flex-wrap gap-2 rounded-md border border-slate-700 bg-slate-900 p-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={subscriptionStatusFilter.includes(null)}
                    onCheckedChange={() => handleStatusToggle(null)}
                  />
                  None
                </label>
                {Object.values(SubscriptionStatus).map((status) => (
                  <label key={status} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={subscriptionStatusFilter.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-400">Active filters</span>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          )}

          {!!data?.totalPages && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Page</span>
              <Input
                type="number"
                min={1}
                defaultValue={currentPage}
                max={data.totalPages}
                className="w-20"
                onChange={(e) => {
                  const value = Number.parseInt(e.currentTarget.value);
                  if (!Number.isNaN(value) && value >= 1 && value <= data.totalPages) {
                    setCurrentPage(value);
                  }
                }}
              />
              <span className="text-sm text-slate-300">/ {data.totalPages}</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-800 px-4 py-3 text-xs font-semibold tracking-wide text-slate-300 uppercase">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Subscription</div>
          <div className="col-span-2">Billing ID</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Change role</div>
        </div>

        {isLoading && <LoadingSpinner />}

        {rows.map((user) => {
          const isCurrentUser = currentUser?.id === user.id;
          return (
            <div key={user.id} className="grid grid-cols-12 gap-3 border-b border-slate-900 px-4 py-3 text-sm">
              <div className="col-span-4">
                <p className="text-slate-100">{user.email}</p>
                <p className="text-xs text-slate-400">{user.username}</p>
              </div>
              <div className="col-span-2 text-slate-300">{user.subscriptionStatus ?? "-"}</div>
              <div className="col-span-2 text-slate-500">{user.paymentProcessorUserId ?? "-"}</div>
              <div className="col-span-2">
                <RoleBadge role={user.role} />
              </div>
              <div className="col-span-2">
                <RoleSelect userId={user.id} role={user.role} disabled={isCurrentUser} />
              </div>
            </div>
          );
        })}

        {!isLoading && rows.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-400">No users found for the selected filters.</div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;
