"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Job {
  id: string;
  title: string;
  level: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

const AVAILABLE_AGENTS = [
  { id: 'backend', name: 'Backend Expert', description: 'System design, APIs, databases, distributed systems' },
  { id: 'ml', name: 'ML Expert', description: 'Machine learning, deep learning, MLOps' },
  { id: 'frontend', name: 'Frontend Expert', description: 'React, Vue, Angular, performance, accessibility' },
  { id: 'hr', name: 'HR Behavioral', description: 'Behavioral questions, communication, teamwork' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState({
    job_id: '',
    candidate_id: '',
    mode: 'voice' as 'voice' | 'chat',
    difficulty: '' as '' | 'junior' | 'mid' | 'senior' | 'staff',
    selectedAgents: [] as string[],
  });

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data.data || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.job_id || !formData.candidate_id) {
      alert('Please select both a job and a candidate');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: formData.job_id,
          candidate_id: formData.candidate_id,
          mode: formData.mode,
          difficulty_override: formData.difficulty || null,
          selected_agents: formData.selectedAgents.length > 0 ? formData.selectedAgents : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create interview');
      }

      const data = await response.json();
      router.push(`/dashboard/interviews/${data.data.id}`);
    } catch (error: any) {
      console.error('Failed to create interview:', error);
      alert(error.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === formData.job_id);

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Interview</CardTitle>
            <CardDescription>Create an interview session for a candidate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="job">Job *</Label>
                <Select
                  value={formData.job_id}
                  onValueChange={(value) => setFormData({ ...formData, job_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} ({job.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate *</Label>
                <Select
                  value={formData.candidate_id}
                  onValueChange={(value) => setFormData({ ...formData, candidate_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Interview Mode *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value: 'voice' | 'chat') => setFormData({ ...formData, mode: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice">Voice (Video + Audio)</SelectItem>
                    <SelectItem value="chat">Chat (Text Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Override (Optional)</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: '' | 'junior' | 'mid' | 'senior' | 'staff') =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect from candidate profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-secondary">
                  Leave as "Auto-detect" to let the system analyze the candidate and set difficulty automatically
                </p>
              </div>

              <div className="space-y-3">
                <Label>Expert Agents (Optional)</Label>
                <p className="text-xs text-text-secondary mb-3">
                  Select which expert agents to use. If none selected, system will auto-select based on job domain.
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

              {selectedJob && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Selected Job: {selectedJob.title}</p>
                  <p className="text-xs text-text-secondary">Level: {selectedJob.level}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    The system will automatically gather candidate details and prepare personalized questions based on
                    the job description, selected difficulty, and candidate profile.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Schedule Interview'}
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

