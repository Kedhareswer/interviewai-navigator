import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithProfile } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { supabase, session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    // Get user's profile with email from auth
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Get email from auth.users
    const { data: { user } } = await supabase.auth.getUser();
    const data = {
      ...profileData,
      email: user?.email || null,
    };

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, session, profile } = await getSessionWithProfile();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = await request.json();

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        company: body.company,
        resume_url: body.resume_url,
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    // Get email from auth
    const { data: { user } } = await supabase.auth.getUser();
    const data = {
      ...updatedProfile,
      email: user?.email || null,
    };

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

