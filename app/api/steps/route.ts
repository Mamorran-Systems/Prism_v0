import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { callLLM, summarize } from '@/lib/llm';
import { TrackType } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { runId, tool, track, prompt, manualResponse } = await req.json();

  if (!runId || !tool || !track || !prompt) {
    return NextResponse.json({ error: 'runId, tool, track, prompt required' }, { status: 400 });
  }

  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { steps: true },
  });
  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });

  const nextIndex = (run.steps?.length ?? 0) + 1;

  let responseText = manualResponse ?? '';
  let durationMs = 0;

  if (track === 'AI') {
    const res = await callLLM(tool, prompt);
    responseText = res.text;
    durationMs = res.durationMs;
  }

  const toSummarize = responseText || prompt;
  const summary = await summarize(toSummarize);

  const step = await prisma.step.create({
    data: {
      runId,
      index: nextIndex,
      track: track as TrackType,
      tool,
      prompt,
      response: responseText,
      summary,
      durationMs,
    },
  });

  return NextResponse.json(step);
}

