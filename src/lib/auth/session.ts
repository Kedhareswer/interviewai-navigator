import { createClient } from "@/lib/supabase/server";

export type UserRole = "hr" | "candidate";

export async function getSessionWithProfile() {
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return { supabase, session: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return { supabase, session, profile };
}

