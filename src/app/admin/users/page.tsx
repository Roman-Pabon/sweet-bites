import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { listRegisteredUsers } from "@/lib/stamps";
import { safeAdminReturnPath } from "@/lib/admin-nav";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { SweetBitesLogo } from "@/components/SweetBitesLogo";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const admin = await getAdminSession();
  const { from } = await searchParams;
  const backHref = safeAdminReturnPath(from);

  if (!admin) {
    const redirectLogin =
      backHref === "/admin"
        ? "/admin/login?redirect=/admin/users"
        : `/admin/login?redirect=${encodeURIComponent(`/admin/users?from=${encodeURIComponent(from || "")}`)}`;
    redirect(redirectLogin);
  }

  const users = await listRegisteredUsers();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-[var(--background)] px-6 py-10">
      <div className="mb-8 text-center">
        <SweetBitesLogo size="sm" />
        <p className="mt-3 text-sm text-[var(--sweet-navy)]/60">Sweet Bites — Admin</p>
      </div>
      <AdminUsersPanel
        adminUsername={admin.username}
        initialUsers={users}
        backHref={backHref}
      />
    </div>
  );
}
