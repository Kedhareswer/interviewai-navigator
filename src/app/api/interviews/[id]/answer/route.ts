import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionWithProfile } from '@/lib/auth/session';
import { interviewOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    // Verify the user has access to this interview
    const supabase = await createClient();
    const { data: interview } = await supabase
      .from('interviews')
      .select('candidate_id, candidates!inner(user_id)')
      .eq('id', id)
      .single();

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found', data: null }, { status: 404 });
    }

    // Only candidates can answer (HR can view but not answer)
    if (profile?.role !== 'candidate') {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    // Verify candidate owns this interview
    const candidateUserId = (interview.candidates as any)?.user_id;
    if (candidateUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    const body = await request.json();

    // Record the answer as an event
    const { data: event, error: eventError } = await supabase
      .from('interview_events')
      .insert({
        interview_id: id,
        type: 'answer',
        payload: {
          answer: body.answer,
          question_id: body.question_id,
        },
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Process answer through orchestrator
    // This will:
    // 1. Send answer to the expert agent for scoring
    // 2. Update planner state
    // 3. Generate next question or finalize
    await interviewOrchestrator.processAnswer(id, body.answer);

    // For now, just return the event
    return NextResponse.json({
      data: { event, message: 'Answer recorded' },
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

