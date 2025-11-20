import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Server-Sent Events endpoint for streaming interview events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const supabase = await createClient();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Set up real-time subscription to interview events
      const channel = supabase
        .channel(`interview:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'interview_events',
            filter: `interview_id=eq.${id}`,
          },
          (payload) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'event', data: payload.new })}\n\n`
              )
            );
          }
        )
        .subscribe();

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`)
        );
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        supabase.removeChannel(channel);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}


