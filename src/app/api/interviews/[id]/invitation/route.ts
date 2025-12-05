import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Public endpoint for interview invitations (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get interview with related data
    const { data: interview, error } = await supabase
      .from('interviews')
      .select(`
        *,
        jobs (*),
        candidates (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found', data: null },
        { status: 404 }
      );
    }

    // Get HR profile who scheduled the interview
    let scheduled_by_profile = null;
    if (interview.scheduled_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company')
        .eq('id', interview.scheduled_by)
        .single();
      scheduled_by_profile = profile;
    }

    // Attach profile data
    const interviewWithProfile = {
      ...interview,
      scheduled_by_profile,
    };

    return NextResponse.json({ data: interviewWithProfile, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}
