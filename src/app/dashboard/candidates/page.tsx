"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  links: any;
  resume_url: string | null;
  created_at: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data.data || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (id: string) => {
    try {
      await fetch(`/api/candidates/${id}/ingest`, { method: 'POST' });
      alert('Ingestion started');
    } catch (error) {
      console.error('Failed to start ingestion:', error);
      alert('Failed to start ingestion');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      fetchCandidates();
    } catch (error) {
      console.error('Failed to delete candidate:', error);
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
            <h1 className="text-3xl font-bold mb-2">Candidates</h1>
            <p className="text-text-secondary">Manage candidate profiles</p>
          </div>
          <Link href="/dashboard/candidates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {candidate.links?.linkedin && (
                    <p className="text-sm text-text-secondary">
                      LinkedIn: {candidate.links.linkedin}
                    </p>
                  )}
                  {candidate.links?.github && (
                    <p className="text-sm text-text-secondary">
                      GitHub: {candidate.links.github}
                    </p>
                  )}
                  {candidate.resume_url && (
                    <p className="text-sm text-text-secondary">
                      Resume: Uploaded
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIngest(candidate.id)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ingest
                  </Button>
                  <Link href={`/dashboard/candidates/${candidate.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(candidate.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {candidates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">No candidates yet</p>
              <Link href="/dashboard/candidates/new">
                <Button>Add Your First Candidate</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

