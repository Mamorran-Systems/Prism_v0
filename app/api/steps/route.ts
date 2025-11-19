// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

import { TrackType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { runId, tool, track, prompt, manualResponse } = await req.json();

    if (!runId || !tool || !track || !prompt) {
      return NextResponse.json(
        { error: 'runId, tool, track, prompt required' },
        { status: 400 }
      );
    }

    const run = await prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const nextIndex =
      (await prisma.step.count({
        where: { runId },
      })) + 1;

    const responseText =
      track === 'MANUAL'
        ? manualResponse ?? ''
        : '[AI response stubbed – wiring only, no OpenAI call]';

    const summary =
      responseText.length > 200
        ? responseText.slice(0, 197) + '...'
        : responseText;

    const step = await prisma.step.create({
      data: {
        runId,
        index: nextIndex,
        track: track as TrackType,
        tool,
        prompt,
        response: responseText,
        summary,
        durationMs: 0,
      },
    });

    return NextResponse.json(step);
  } catch (err) {
    console.error('Error in /api/steps', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
