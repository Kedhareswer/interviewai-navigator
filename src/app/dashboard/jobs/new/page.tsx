"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    level: 'mid',
    description_raw: '',
    selectedAgents: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          level: formData.level,
          description_raw: formData.description_raw,
          preferred_agents: formData.selectedAgents.length > 0 ? formData.selectedAgents : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create job');

      const data = await response.json();
      
      // Trigger ingestion
      await fetch(`/api/jobs/${data.data.id}/ingest`, { method: 'POST' });
      
      router.push(`/dashboard/jobs/${data.data.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
            <CardDescription>Add a new job posting</CardDescription>
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
                  placeholder="Paste the full job description here..."
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Expert Agents (Optional)</Label>
                <p className="text-xs text-text-secondary mb-3">
                  Select which expert agents should be used for interviews for this job. If none selected, system will auto-select based on job domain.
                </p>
                <div className="space-y-3 border rounded-lg p-4">
                  {AVAILABLE_AGENTS.map((agent) => (
                    <div key={agent.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={agent.id}
                        checked={formData.selectedAgents.includes(agent.id)}
                        onCheckedChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            selectedAgents: prev.selectedAgents.includes(agent.id)
                              ? prev.selectedAgents.filter((id) => id !== agent.id)
                              : [...prev.selectedAgents, agent.id],
                          }));
                        }}
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Job'}
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

