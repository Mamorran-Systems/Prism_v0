import OpenAI from 'openai';
import { MODELS } from './config';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is missing');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callLLM(model: string, prompt: string): Promise<{ text: string; tokens: number; durationMs: number }> {
  const t0 = Date.now();

  const res = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.choices[0]?.message?.content ?? '';
  const tokens = res.usage?.total_tokens ?? 0;
  const durationMs = Date.now() - t0;

  return { text, tokens, durationMs };
}

export async function summarize(text: string): Promise<string> {
  const truncated = text.length > 3000 ? text.slice(0, 3000) : text;
  const prompt = `Summarize the following in 1–2 short sentences, focusing on what was produced or changed:\n\n${truncated}`;
  const { text: summary } = await callLLM(MODELS.small, prompt);
  return summary.trim();
}

