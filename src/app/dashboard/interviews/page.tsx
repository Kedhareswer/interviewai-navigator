"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Eye } from 'lucide-react';

interface Interview {
  id: string;
  status: string;
  mode: string;
  created_at: string;
  jobs?: { title: string };
  candidates?: { name: string };
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interviews');
      const data = await response.json();
      setInterviews(data.data || []);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'scheduled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interviews</h1>
            <p className="text-text-secondary">Manage interview sessions</p>
          </div>
          <Link href="/dashboard/interviews/new">
            <Button>Schedule Interview</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {interview.jobs?.title || 'Unknown Job'} - {interview.candidates?.name || 'Unknown Candidate'}
                    </CardTitle>
                    <CardDescription>
                      {new Date(interview.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/dashboard/interviews/${interview.id}`}>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  {interview.status === 'scheduled' && (
                    <Link href={`/dashboard/interviews/${interview.id}/start`}>
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Start Interview
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {interviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">No interviews yet</p>
              <Link href="/dashboard/interviews/new">
                <Button>Schedule Your First Interview</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

