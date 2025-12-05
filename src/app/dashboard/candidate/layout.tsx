import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionWithProfile } from "@/lib/auth/session";

export default async function CandidateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, profile } = await getSessionWithProfile();

  if (!session) {
    redirect("/login");
  }

  if (profile?.role === "hr") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

