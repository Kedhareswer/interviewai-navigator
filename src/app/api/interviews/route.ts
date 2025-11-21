import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithProfile } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { supabase, session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('job_id');
    const candidateId = searchParams.get('candidate_id');

    let query = supabase
      .from('interviews')
      .select(`
        *,
        jobs (*),
        candidates (*)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (candidateId) {
      query = query.eq('candidate_id', candidateId);
    }

    if (profile?.role === 'candidate') {
      const { data: candidateRecord } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();

      if (!candidateRecord) {
        return NextResponse.json({ data: [], error: null });
      }

      query = query.eq('candidate_id', candidateRecord.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    if (profile?.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        job_id: body.job_id,
        candidate_id: body.candidate_id,
        mode: body.mode || 'chat',
        status: 'scheduled',
        scheduled_by: session.user.id,
        difficulty_override: body.difficulty_override || null,
        selected_agents: body.selected_agents || null,
      })
      .select(`
        *,
        jobs (*),
        candidates (*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


