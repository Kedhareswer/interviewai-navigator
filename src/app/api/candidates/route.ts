import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        name: body.name,
        email: body.email,
        links: body.links || {},
        resume_url: body.resume_url,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger candidate ingestion (async)
    // TODO: Queue candidate ingestion task

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


