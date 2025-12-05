import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionWithProfile } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify user has access to this interview
    const { data: interview } = await supabase
      .from('interviews')
      .select(`
        *,
        candidates!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found', data: null }, { status: 404 });
    }

    // Check access: HR can see all, candidates can only see their own
    if (profile?.role === 'candidate') {
      const candidateUserId = (interview.candidates as any)?.user_id;
      if (candidateUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
      }
    } else if (profile?.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    // Get evaluation if it exists
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('interview_id', id)
      .single();

    if (evalError && evalError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay
      throw evalError;
    }

    // If no evaluation exists, check if interview is completed
    if (!evaluation) {
      if (interview.status !== 'completed') {
        return NextResponse.json({
          data: null,
          error: 'Evaluation not yet available',
        }, { status: 404 });
      }
    }

    // For candidates, extract candidateSummary from scores_json if available
    if (profile?.role === 'candidate' && evaluation) {
      const scoresJson = evaluation.scores_json as any;
      if (scoresJson?.candidateSummary) {
        return NextResponse.json({
          data: {
            ...evaluation,
            candidateSummary: scoresJson.candidateSummary,
            summary: scoresJson.candidateSummary, // Use candidate summary for candidates
          },
          error: null,
        });
      }
    }

    return NextResponse.json({ data: evaluation, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


