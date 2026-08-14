import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AuthForm } from "@/components/AuthForm";

export default async function Home() {
  const session = await getSession();
  if (session) {
    const db = await getDb();
    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(session.userId);

    if (user) {
      redirect("/card");
    }

    await destroySession();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-12">
      <AuthForm />
    </div>
  );
}
