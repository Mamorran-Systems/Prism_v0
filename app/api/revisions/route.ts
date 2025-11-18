import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { summarize } from '@/lib/llm';

export async function POST(req: NextRequest) {
  const { runId, label, parentRevisionId } = await req.json();
  if (!runId || !label) return NextResponse.json({ error: 'runId and label required' }, { status: 400 });

  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { steps: { orderBy: { index: 'asc' } } },
  });
  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  if (run.steps.length === 0) return NextResponse.json({ error: 'No steps in run' }, { status: 400 });

  const stepIndex = run.steps[run.steps.length - 1].index;
  const combinedSummaries = run.steps
    .map((s) => `#${s.index} (${s.tool}): ${s.summary}`)
    .join('\n');

  const summary = await summarize(combinedSummaries);

  const rev = await prisma.revision.create({
    data: {
      runId,
      label,
      stepIndex,
      parentRevisionId: parentRevisionId ?? null,
      summary,
    },
  });

  return NextResponse.json(rev);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');
  if (!runId) return NextResponse.json({ error: 'runId required' }, { status: 400 });

  const revisions = await prisma.revision.findMany({
    where: { runId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(revisions);
}

