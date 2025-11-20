import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { interviewOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Update interview status
    const { data: interview, error: updateError } = await supabase
      .from('interviews')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        jobs (*),
        candidates (*)
      `)
      .single();

    if (updateError) throw updateError;

    // Initialize and start the interview orchestrator
    // This will:
    // 1. Run CandidateUnderstandingAgent
    // 2. Initialize PlannerAgent
    // 3. Start the interview cycle
    await interviewOrchestrator.start(interview.id);

    // For now, just return success
    return NextResponse.json({
      data: { interview, message: 'Interview started' },
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

