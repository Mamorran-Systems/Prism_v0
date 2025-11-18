import Link from 'next/link';
import { prisma } from '@/lib/db';
import { FolderOpen, Play } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: { runs: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) return <div>Not found</div>;

  async function createRun(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '');
    if (!name) return;
    await prisma.run.create({
      data: { projectId: project.id, name },
    });
    revalidatePath(`/projects/${project.id}`);
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-neutral-800 p-4 space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {project.name}
        </h2>
        <form action={createRun} className="flex gap-2">
          <input
            name="name"
            placeholder="New run"
            className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-sm border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            Add
          </button>
        </form>
        <ul className="space-y-1 text-sm">
          {project.runs.map((r) => (
            <li key={r.id}>
              <Link
                href={`/projects/${project.id}/runs/${r.id}`}
                className="block px-3 py-2 rounded-md hover:bg-neutral-900 transition-colors flex items-center gap-2"
              >
                <Play className="w-3 h-3" />
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
        Select a run.
      </div>
    </div>
  );
}

