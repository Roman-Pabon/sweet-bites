import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const admin = await getAdminSession();
  const { redirect: redirectTo } = await searchParams;

  if (admin) {
    redirect(redirectTo || "/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-black text-[var(--sweet-navy)]">Admin</h1>
        <p className="mt-2 text-sm text-[var(--sweet-navy)]/60">Sweet Bites</p>
      </div>
      <div className="w-full max-w-sm">
        <AdminLoginForm redirectTo={redirectTo || "/admin"} />
      </div>
    </div>
  );
}
