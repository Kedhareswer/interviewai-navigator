import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithProfile } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { supabase, session } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

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
      .from('jobs')
      .insert({
        title: body.title,
        level: body.level,
        description_raw: body.description_raw,
        created_by: session.user.id,
        preferred_agents: body.preferred_agents || null,
      })
      .select()
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


