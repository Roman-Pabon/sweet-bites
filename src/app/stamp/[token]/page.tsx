import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getUserByStampToken } from "@/lib/stamps";
import { toPublicUser } from "@/lib/db";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminStampPanel } from "@/components/AdminStampPanel";
import { SweetBitesLogo } from "@/components/SweetBitesLogo";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function StampPage({ params }: Props) {
  const { token } = await params;
  const user = getUserByStampToken(token);

  if (!user) {
    notFound();
  }

  const admin = await getAdminSession();
  const redirectTo = `/stamp/${token}`;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-[var(--background)] px-6 py-10">
      <div className="mb-8 text-center">
        <SweetBitesLogo size="sm" />
        <h1 className="mt-4 text-xl font-bold text-[var(--sweet-navy)]">Panel de sellos</h1>
        <p className="mt-1 text-sm text-[var(--sweet-navy)]/60">Sweet Bites — Admin</p>
      </div>

      {admin ? (
        <AdminStampPanel
          token={token}
          adminUsername={admin.username}
          initialCustomer={toPublicUser(user)}
        />
      ) : (
        <div className="w-full max-w-sm">
          <p className="mb-4 text-center text-sm text-[var(--sweet-navy)]/70">
            Inicia sesión como admin para marcar una galleta a este cliente.
          </p>
          <AdminLoginForm redirectTo={redirectTo} />
        </div>
      )}
    </div>
  );
}
