import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithProfile } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { supabase, session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const self = searchParams.get('self') === 'true';

    if (self) {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ data, error: null });
    }

    if (profile?.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('candidates')
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

    const body = await request.json();
    const basePayload = {
      name: body.name,
      email: profile?.role === 'hr' ? body.email : session.user.email,
      links: body.links || {},
      resume_url: body.resume_url,
    };

    let query;

    if (profile?.role === 'candidate') {
      query = supabase
        .from('candidates')
        .upsert(
          {
            ...basePayload,
            user_id: session.user.id,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
    } else if (profile?.role === 'hr') {
      query = supabase
        .from('candidates')
        .insert({
          ...basePayload,
          user_id: body.user_id || null,
        })
        .select()
        .single();
    } else {
      return NextResponse.json({ error: 'Forbidden', data: null }, { status: 403 });
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


