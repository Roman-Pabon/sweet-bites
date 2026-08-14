import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-[var(--sweet-navy)]">Hola, {admin.username}</h1>
        <p className="mt-3 text-[var(--sweet-navy)]/70">
          Escanea el QR de la tarjeta de un cliente para marcar sus galletas.
        </p>
        <div className="mt-8 rounded-2xl border-2 border-[var(--sweet-gold)] bg-[var(--sweet-navy)] p-6">
          <p className="text-4xl">📱</p>
          <p className="mt-3 text-sm text-[var(--sweet-gold)]">
            Apunta la cámara al QR en la tarjeta del cliente y pulsa &quot;Marcar galleta&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
