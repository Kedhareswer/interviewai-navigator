"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  level: string;
  description_raw: string;
  normalized_json: any;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
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
            <h1 className="text-3xl font-bold mb-2">Jobs</h1>
            <p className="text-text-secondary">Manage job postings</p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                  Level: {job.level} • {new Date(job.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                  {job.description_raw.substring(0, 150)}...
                </p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">No jobs yet</p>
              <Link href="/dashboard/jobs/new">
                <Button>Create Your First Job</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

