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

  const projectId = project.id;

  async function createRun(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '');
    if (!name) return;
    await prisma.run.create({
      data: { projectId, name },
    });
    revalidatePath(`/projects/${projectId}`);
  }

  return (
    <div className="prism-wrapper m-4">
      <div className="flex h-full prism-border rounded-lg overflow-hidden">
        <div className="w-80 glass-card border-r border-white/30 p-4 space-y-4 rounded-l-lg">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-700">
            <FolderOpen className="w-4 h-4" />
            {project.name}
          </h2>
          <form action={createRun} className="flex gap-2">
            <input
              name="name"
              placeholder="New run"
              className="flex-1 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 text-sm border border-white/50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Add
            </button>
          </form>
          <ul className="space-y-1 text-sm">
            {project.runs.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/projects/${projectId}/runs/${r.id}`}
                  className="block px-3 py-2 rounded-lg hover:bg-white/60 transition-colors flex items-center gap-2 text-slate-700"
                >
                  <Play className="w-3 h-3" />
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select a run.
        </div>
      </div>
    </div>
  );
}

