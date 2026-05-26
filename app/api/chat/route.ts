import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/buildSystemPrompt';
import { QuizAnswers, Message } from '@/lib/types';

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let body: { messages: Message[]; quizAnswers: QuizAnswers };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, quizAnswers } = body;
  const systemPrompt = buildSystemPrompt(quizAnswers);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const chunk of response) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
