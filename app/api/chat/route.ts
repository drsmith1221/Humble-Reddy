import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/buildSystemPrompt';
import { QuizAnswers, Message } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { messages, quizAnswers }: { messages: Message[]; quizAnswers: QuizAnswers } =
    await request.json();

  const systemPrompt = buildSystemPrompt(quizAnswers);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
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

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
