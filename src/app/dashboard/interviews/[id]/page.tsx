"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInterview } from '@/hooks/use-interview';
import { Play, Send, Share2, Copy } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  const { events, isConnected, submitAnswer, startInterview, getEvaluation } = useInterview(interviewId);
  const [answer, setAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadEvaluation = useCallback(async () => {
    const evalData = await getEvaluation();
    if (evalData?.data) {
      setEvaluation(evalData.data);
    }
  }, [getEvaluation]);

  useEffect(() => {
    // Get latest question
    const questionEvent = events
      .filter(e => e.type === 'question')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (questionEvent) {
      setCurrentQuestion(questionEvent.payload);
    }

    // Check for evaluation
    if (events.some(e => e.type === 'system' && e.payload?.message === 'Interview completed')) {
      loadEvaluation();
    }
  }, [events, loadEvaluation]);

  const handleStart = async () => {
    try {
      await startInterview();
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return;

    try {
      await submitAnswer(answer, currentQuestion.id);
      setAnswer('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleShareInvitation = async () => {
    const invitationUrl = `${window.location.origin}/interview/${interviewId}`;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Interview Session</CardTitle>
                <CardDescription>
                  Status: {isConnected ? 'Connected' : 'Disconnected'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareInvitation}
              >
                {copied ? (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Invitation
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {!currentQuestion && events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">Interview not started</p>
              <Button onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </CardContent>
          </Card>
        )}

        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{currentQuestion.text}</p>
              <div className="space-y-4">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                />
                <Button onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {evaluation && (
          <Card>
            <CardHeader>
              <CardTitle>Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Recommendation</h3>
                  <Badge>{evaluation.recommendation}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-text-secondary">{evaluation.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Scores</h3>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(evaluation.scores_json, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Interview Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{event.type}</Badge>
                    <span className="text-xs text-text-secondary">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {event.type === 'question' && event.payload.text}
                    {event.type === 'answer' && event.payload.answer}
                    {event.type === 'score' && `Score: ${event.payload.score}`}
                    {event.type === 'system' && event.payload.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

