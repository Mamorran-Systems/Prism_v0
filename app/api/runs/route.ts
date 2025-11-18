import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { projectId, name } = await req.json();
  if (!projectId || !name) return NextResponse.json({ error: 'projectId and name required' }, { status: 400 });

  const run = await prisma.run.create({
    data: { projectId, name },
  });
  return NextResponse.json(run);
}

