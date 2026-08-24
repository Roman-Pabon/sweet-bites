import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { listRegisteredUsers } from "@/lib/stamps";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { SweetBitesLogo } from "@/components/SweetBitesLogo";

export default async function AdminUsersPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login?redirect=/admin/users");
  }

  const users = await listRegisteredUsers();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-[var(--background)] px-6 py-10">
      <div className="mb-8 text-center">
        <SweetBitesLogo size="sm" />
        <p className="mt-3 text-sm text-[var(--sweet-navy)]/60">Sweet Bites — Admin</p>
      </div>
      <AdminUsersPanel adminUsername={admin.username} initialUsers={users} />
    </div>
  );
}
