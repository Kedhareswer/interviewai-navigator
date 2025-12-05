"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";

type RoleOption = "hr" | "candidate";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<RoleOption>("candidate");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          company: role === "hr" ? company : null,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage(
      "Check your inbox to confirm your email. Once verified, you can sign in."
    );
    setFullName("");
    setEmail("");
    setPassword("");
    setCompany("");

    setTimeout(() => router.replace("/login"), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">
            Create your InterviewOS account
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Specify your role to get the right workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as RoleOption)}
                className="grid gap-3 md:grid-cols-2"
              >
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="candidate" id="candidate" />
                    <Label htmlFor="candidate">Candidate</Label>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Upload your resume, track interviews, and view feedback.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hr" id="hr" />
                    <Label htmlFor="hr">Hiring team</Label>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Manage jobs, candidates, and run AI-driven interviews.
                  </p>
                </div>
              </RadioGroup>
            </div>

            {role === "hr" && (
              <div className="space-y-2">
                <Label htmlFor="company">Company / team</Label>
                <Input
                  id="company"
                  placeholder="Acme Robotics"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  required={role === "hr"}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-primary" role="status">
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-center text-text-secondary mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

