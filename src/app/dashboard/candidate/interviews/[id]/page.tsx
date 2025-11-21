"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { VideoRecorder } from "@/components/interview/VideoRecorder";
import { Send, Play, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InterviewEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

interface Evaluation {
  recommendation: string;
  summary: string;
  candidateSummary?: string;
  scores_json: any;
}

export default function CandidateInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  const supabase = createClient();

  const [interview, setInterview] = useState<any>(null);
  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadInterview();
    const interval = setInterval(() => {
      loadEvents();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [interviewId]);

  const loadInterview = async () => {
    try {
      // Get candidate ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: candidateRecord } = await supabase
        .from("candidates")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!candidateRecord) {
        setLoading(false);
        return;
      }

      // Fetch interview
      const response = await fetch(`/api/interviews?candidate_id=${candidateRecord.id}`);
      const data = await response.json();
      const found = data.data?.find((i: any) => i.id === interviewId);
      if (found) {
        setInterview(found);
        loadEvents();
      }
    } catch (error) {
      console.error("Failed to load interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data: eventsData } = await supabase
        .from("interview_events")
        .select("*")
        .eq("interview_id", interviewId)
        .order("timestamp", { ascending: true });

      if (eventsData) {
        setEvents(eventsData);

        // Get latest question
        const questionEvent = eventsData
          .filter((e) => e.type === "question")
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];

        if (questionEvent) {
          setCurrentQuestion(questionEvent.payload);
        }

        // Check for completion and load evaluation
        if (
          eventsData.some(
            (e) => e.type === "system" && e.payload?.message === "Interview completed"
          )
        ) {
          loadEvaluation();
        }
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const loadEvaluation = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/evaluation`);
      const data = await response.json();
      if (data.data) {
        setEvaluation(data.data);
      }
    } catch (error) {
      console.error("Failed to load evaluation:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    const answerText = transcript.trim() || answer.trim();
    if (!answerText || !currentQuestion) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: answerText,
          question_id: currentQuestion.id || events.find((e) => e.type === "question")?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit answer");

      setAnswer("");
      setTranscript("");
      setCurrentQuestion(null);
      setTimeout(() => loadEvents(), 1000);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordingComplete = async (videoBlob: Blob, audioBlob: Blob) => {
    // Upload video/audio to storage (optional - for now just use transcript)
    console.log("Recording completed", { videoBlob, audioBlob });
    // Video/audio storage can be implemented later
  };

  if (loading) {
    return <div className="p-6">Loading interview...</div>;
  }

  if (!interview) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">Interview not found</p>
            <Button onClick={() => router.push("/dashboard/candidate")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVoiceMode = interview.mode === "voice";
  const isCompleted = interview.status === "completed";

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  Interview: {interview.jobs?.title || "Unknown Job"}
                </CardTitle>
                <CardDescription>
                  Status: <Badge>{interview.status}</Badge>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/candidate")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>

        {!currentQuestion && events.length === 0 && !isCompleted && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">
                Interview not started yet. Please wait for the HR to start the interview.
              </p>
            </CardContent>
          </Card>
        )}

        {currentQuestion && !isCompleted && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-6">{currentQuestion.text}</p>

                {isVoiceMode ? (
                  <div className="space-y-4">
                    <VideoRecorder
                      onRecordingComplete={handleRecordingComplete}
                      onTranscriptUpdate={(text) => {
                        setTranscript(text);
                        setAnswer(text);
                      }}
                      disabled={submitting}
                    />
                    <div className="flex gap-4">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!transcript.trim() && !answer.trim() || submitting}
                        className="w-full"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={8}
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim() || submitting}
                      className="w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit Answer"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {isCompleted && evaluation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Interview Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Feedback</h3>
                <p className="text-text-secondary">
                  {evaluation.candidateSummary || evaluation.summary}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recommendation</h3>
                <Badge variant="outline">{evaluation.recommendation}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Interview Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline">{event.type}</Badge>
                    <span className="text-xs text-text-secondary">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {event.type === "question" && event.payload.text}
                    {event.type === "answer" && event.payload.answer}
                    {event.type === "score" &&
                      `Score: ${event.payload.score} - ${event.payload.competency}`}
                    {event.type === "system" && event.payload.message}
                  </p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">
                  No events yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

