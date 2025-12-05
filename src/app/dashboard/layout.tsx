import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionWithProfile } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, profile } = await getSessionWithProfile();

  if (!session) {
    redirect("/login");
  }

  if (profile?.role === "candidate") {
    redirect("/dashboard/candidate");
  }

  return <>{children}</>;
}

