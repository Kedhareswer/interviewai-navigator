"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Briefcase, Calendar, Video, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface InterviewData {
  id: string;
  status: string;
  mode: string;
  created_at: string;
  jobs?: {
    id: string;
    title: string;
    level: string;
    description_raw: string;
    normalized_json?: any;
  } | null;
  candidates?: {
    id: string;
    name: string;
    email: string;
  } | null;
  scheduled_by_profile?: {
    full_name: string;
    company: string;
  } | null;
}

export default function InterviewInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  const loadInterview = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/invitation`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load interview');
      }

      setInterview(data.data);
    } catch (err: any) {
      console.error('Failed to load interview:', err);
      setError(err.message || 'Interview not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>{error || 'This interview invitation is invalid or has expired.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVoiceMode = interview.mode === 'voice';
  const competencies = interview.jobs?.normalized_json?.competencies || [];

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Interview Invitation</h1>
          <p className="text-lg text-text-secondary">
            You've been invited for an interview
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {interview.jobs?.title || 'Interview'}
                </CardTitle>
                <CardDescription className="text-base">
                  <Badge variant="outline" className="mr-2">
                    {interview.jobs?.level || 'Mid'} Level
                  </Badge>
                  {isVoiceMode ? (
                    <Badge className="bg-blue-500">
                      <Video className="w-3 h-3 mr-1" />
                      Voice Interview
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat Interview
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                {interview.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company & HR Info */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              {interview.scheduled_by_profile?.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-text-secondary">
                      {interview.scheduled_by_profile.company}
                    </p>
                  </div>
                </div>
              )}
              {interview.scheduled_by_profile?.full_name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Invited by</p>
                    <p className="text-sm text-text-secondary">
                      {interview.scheduled_by_profile.full_name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            {interview.jobs?.description_raw && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Description
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {interview.jobs.description_raw.substring(0, 500)}
                    {interview.jobs.description_raw.length > 500 && '...'}
                  </p>
                </div>
              </div>
            )}

            {/* Competencies */}
            {competencies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Key Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {competencies.map((comp: any, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {comp.name || comp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Interview Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Mode:</span>
                  <span className="font-medium">
                    {isVoiceMode ? 'Video + Audio' : 'Text Chat'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(interview.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {isVoiceMode && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> This is a voice interview. Please ensure you have a working
                      camera and microphone. The interview will be recorded for evaluation purposes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              {interview.status === 'scheduled' ? (
                <>
                  <Link href={`/login?redirect=/dashboard/candidate/interviews/${interviewId}`} className="flex-1">
                    <Button className="w-full" size="lg">
                      Accept & Attend Interview
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Sign Up First
                    </Button>
                  </Link>
                </>
              ) : interview.status === 'in_progress' ? (
                <Link href={`/login?redirect=/dashboard/candidate/interviews/${interviewId}`} className="flex-1">
                  <Button className="w-full" size="lg">
                    Continue Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/login?redirect=/dashboard/candidate/interviews/${interviewId}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    View Results
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-text-secondary">
          <p>
            Questions? Contact{" "}
            {interview.scheduled_by_profile?.full_name || "the hiring team"}
          </p>
        </div>
      </div>
    </div>
  );
}

