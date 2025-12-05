"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw } from 'lucide-react';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    github: '',
    notes: '',
    resume_url: '',
  });

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      const data = await response.json();
      if (data.data) {
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          linkedin: data.data.links?.linkedin || '',
          github: data.data.links?.github || '',
          notes: data.data.links?.notes || '',
          resume_url: data.data.resume_url || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          links: {
            linkedin: formData.linkedin,
            github: formData.github,
            notes: formData.notes,
          },
          resume_url: formData.resume_url,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update candidate');
      }

      alert('Candidate updated successfully');
      router.push('/dashboard/candidates');
    } catch (error: any) {
      console.error('Failed to update candidate:', error);
      alert(error.message || 'Failed to update candidate');
    } finally {
      setSaving(false);
    }
  };

  const handleIngest = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/ingest`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start ingestion');
      alert('Ingestion started');
    } catch (error) {
      console.error('Failed to start ingestion:', error);
      alert('Failed to start ingestion');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Candidate</CardTitle>
            <CardDescription>Update candidate information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume_url">Resume URL</Label>
                <Input
                  id="resume_url"
                  type="url"
                  value={formData.resume_url}
                  onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleIngest}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ingest Data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

