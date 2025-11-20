import { NextRequest, NextResponse } from 'next/server';
import { candidateIngestionService } from '@/lib/ingestion/candidate-ingestion';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Trigger candidate ingestion
    await candidateIngestionService.ingestCandidate(params.id);

    return NextResponse.json({
      data: { message: 'Candidate ingestion started' },
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

