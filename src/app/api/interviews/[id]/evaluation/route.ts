import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get evaluation if it exists
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('interview_id', params.id)
      .single();

    if (evalError && evalError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay
      throw evalError;
    }

    // If no evaluation exists, check if interview is completed
    if (!evaluation) {
      const { data: interview } = await supabase
        .from('interviews')
        .select('status')
        .eq('id', params.id)
        .single();

      if (interview?.status !== 'completed') {
        return NextResponse.json({
          data: null,
          error: 'Evaluation not yet available',
        }, { status: 404 });
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


