import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect("/card");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--background)] px-6 py-12">
      <AuthForm />
    </div>
  );
}
