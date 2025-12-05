import { NextRequest, NextResponse } from 'next/server';
import { jobIngestionService } from '@/lib/ingestion/job-ingestion';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Trigger job ingestion
    const normalized = await jobIngestionService.ingestJob(id);

    return NextResponse.json({
      data: { normalized, message: 'Job ingestion completed' },
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

