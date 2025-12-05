"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_AGENTS = [
  { id: 'backend', name: 'Backend Expert', description: 'System design, APIs, databases, distributed systems' },
  { id: 'ml', name: 'ML Expert', description: 'Machine learning, deep learning, MLOps' },
  { id: 'frontend', name: 'Frontend Expert', description: 'React, Vue, Angular, performance, accessibility' },
  { id: 'hr', name: 'HR Behavioral', description: 'Behavioral questions, communication, teamwork' },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    level: 'mid',
    description_raw: '',
    selectedAgents: [] as string[],
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (data.data) {
        setFormData({
          title: data.data.title || '',
          level: data.data.level || 'mid',
          description_raw: data.data.description_raw || '',
          selectedAgents: data.data.preferred_agents || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          level: formData.level,
          description_raw: formData.description_raw,
          preferred_agents: formData.selectedAgents.length > 0 ? formData.selectedAgents : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job');
      }

      alert('Job updated successfully');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Failed to update job:', error);
      alert(error.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleAgentToggle = (agentId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(agentId)
        ? prev.selectedAgents.filter((id) => id !== agentId)
        : [...prev.selectedAgents, agentId],
    }));
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Job</CardTitle>
            <CardDescription>Update job posting information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description_raw}
                  onChange={(e) => setFormData({ ...formData, description_raw: e.target.value })}
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Expert Agents (Optional)</Label>
                <p className="text-xs text-text-secondary mb-3">
                  Select which expert agents should be used for interviews for this job.
                </p>
                <div className="space-y-3 border rounded-lg p-4">
                  {AVAILABLE_AGENTS.map((agent) => (
                    <div key={agent.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={agent.id}
                        checked={formData.selectedAgents.includes(agent.id)}
                        onCheckedChange={() => handleAgentToggle(agent.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={agent.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {agent.name}
                        </Label>
                        <p className="text-xs text-text-secondary mt-1">{agent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
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

