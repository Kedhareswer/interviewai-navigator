"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Briefcase, Users, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    interviews: 0,
  });

  useEffect(() => {
    // Fetch stats
    Promise.all([
      fetch('/api/jobs').then(r => r.json()),
      fetch('/api/candidates').then(r => r.json()),
      fetch('/api/interviews').then(r => r.json()),
    ]).then(([jobs, candidates, interviews]) => {
      setStats({
        jobs: jobs.data?.length || 0,
        candidates: candidates.data?.length || 0,
        interviews: interviews.data?.length || 0,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-text-secondary">Manage jobs, candidates, and interviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.candidates}</div>
              <p className="text-xs text-muted-foreground">Total candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interviews}</div>
              <p className="text-xs text-muted-foreground">Total interviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>Manage job postings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/jobs">
                <Button className="w-full" variant="outline">
                  View All Jobs
                </Button>
              </Link>
              <Link href="/dashboard/jobs/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>Manage candidate profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/candidates">
                <Button className="w-full" variant="outline">
                  View All Candidates
                </Button>
              </Link>
              <Link href="/dashboard/candidates/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interviews</CardTitle>
              <CardDescription>Manage interview sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/interviews">
                <Button className="w-full" variant="outline">
                  View All Interviews
                </Button>
              </Link>
              <Link href="/dashboard/interviews/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

