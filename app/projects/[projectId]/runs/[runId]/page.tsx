import RunClient from './run-client';
import { prisma } from '@/lib/db';

export default async function RunPage({ params }: { params: { projectId: string; runId: string } }) {
  const run = await prisma.run.findUnique({
    where: { id: params.runId },
    include: {
      project: true,
      steps: { orderBy: { index: 'asc' } },
      revisions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!run) return <div>Not found</div>;

  return (
    <RunClient
      runId={run.id}
      projectId={run.projectId}
      initialSteps={run.steps}
      initialRevisions={run.revisions}
      projectName={run.project.name}
      runName={run.name}
    />
  );
}

