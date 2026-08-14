import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { getDb, type User } from "@/lib/db";
import { getStampUrl, generateStampToken } from "@/lib/tokens";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { UserMenu } from "@/components/UserMenu";

export default async function CardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const db = await getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.userId) as User | undefined;

  if (!user) {
    await destroySession();
    redirect("/");
  }

  let stampToken = user.stamp_token;
  if (!stampToken) {
    stampToken = generateStampToken();
    (await getDb()).prepare("UPDATE users SET stamp_token = ? WHERE id = ?").run(stampToken, user.id);
  }

  const stampUrl = getStampUrl(stampToken);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
      {/* Barra superior fija — mobile first */}
      <header className="sticky top-0 z-40 flex items-center justify-end border-b border-[var(--sweet-gold-dark)]/30 bg-[var(--background)]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <UserMenu username={user.username} avatarUrl={user.avatar_url} />
      </header>

      <div className="flex flex-1 flex-col items-center px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <LoyaltyCard
          username={user.username}
          stamps={user.stamps}
          rewards={user.rewards}
          stampUrl={stampUrl}
        />
        <p className="mt-6 max-w-[380px] animate-[wallet-section-reveal_0.5s_cubic-bezier(0.22,1,0.36,1)_0.65s_both] text-center text-sm text-[var(--sweet-navy)]/60">
          Muestra esta tarjeta en la tienda para acumular sellos y canjear tu bubble tea grátis.
        </p>
      </div>
    </div>
  );
}
