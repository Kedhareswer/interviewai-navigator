"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  links: Record<string, string>;
  resume_url: string | null;
}

interface InterviewRecord {
  id: string;
  status: string;
  mode: string;
  job_id: string;
  jobs?: {
    title: string;
    level: string;
  } | null;
  created_at: string;
}

export default function CandidateDashboardPage() {
  const supabase = createClient();
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedin: "",
    github: "",
    notes: "",
    resume_url: "",
  });

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const response = await fetch("/api/candidates?self=true");
        const { data } = await response.json();

        if (data) {
          setCandidate(data);
          setForm({
            name: data.name ?? "",
            email: data.email ?? "",
            linkedin: data.links?.linkedin ?? "",
            github: data.links?.github ?? "",
            notes: data.links?.notes ?? "",
            resume_url: data.resume_url ?? "",
          });

          const interviewsResponse = await fetch(
            `/api/interviews?candidate_id=${data.id}`
          );
          const interviewsPayload = await interviewsResponse.json();
          setInterviews(interviewsPayload.data || []);
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          setForm((current) => ({
            ...current,
            email: user?.email ?? "",
          }));
        }
      } catch (candidateError) {
        console.error(candidateError);
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadCandidate();
  }, [supabase]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please sign in again to upload your resume.");
      return;
    }

    const path = `${user.id}/resume-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("candidates")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("candidates").getPublicUrl(path);

    setForm((prev) => ({
      ...prev,
      resume_url: data.publicUrl,
    }));
    setSuccess("Resume uploaded. Don’t forget to save changes.");
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          resume_url: form.resume_url,
          links: {
            linkedin: form.linkedin,
            github: form.github,
            notes: form.notes,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save profile.");
      }

      setCandidate(payload.data);
      setSuccess("Profile updated successfully.");
    } catch (saveError: any) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidate dashboard</h1>
          <p className="text-text-secondary">
            Manage your profile, resume, and interview readiness.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/you"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label
                >
                <Input
                  id="github"
                  name="github"
                  value={form.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/you"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional context</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder="Tell us about recent work, preferred roles, or constraints."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Upload resume / CV</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
              {form.resume_url && (
                <p className="text-sm text-text-secondary">
                  Resume uploaded.{" "}
                  <a
                    href={form.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View file
                  </a>
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-primary" role="status">
                {success}
              </p>
            )}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <p className="text-text-secondary">
                No interviews scheduled yet. You’ll see them here once an HR
                partner schedules you.
              </p>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div>
                      <p className="font-medium">
                        {interview.jobs?.title ?? "Interview"} ·{" "}
                        <span className="text-sm text-text-secondary">
                          {interview.mode.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-text-secondary">
                        Status: <Badge variant="outline">{interview.status}</Badge>
                      </p>
                      <p className="text-xs text-text-secondary">
                        Scheduled on{" "}
                        {new Date(interview.created_at).toLocaleString()}
                      </p>
                    </div>
                    {(interview.status === "scheduled" || interview.status === "in_progress") && (
                      <Link href={`/dashboard/candidate/interviews/${interview.id}`}>
                        <Button className="w-full">
                          {interview.status === "scheduled" ? "Attend Interview" : "Continue Interview"}
                        </Button>
                      </Link>
                    )}
                    {interview.status === "completed" && (
                      <Link href={`/dashboard/candidate/interviews/${interview.id}`}>
                        <Button variant="outline" className="w-full">
                          View Results
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

