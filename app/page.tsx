'use client';

import { useEffect, useState } from 'react';
import { Folder } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects);
  }, []);

  async function createProject() {
    if (!name.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });
    const p = await res.json();
    setProjects((prev) => [p, ...prev]);
    setName('');
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-neutral-800 p-4 space-y-4">
        <h1 className="text-base font-semibold flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Projects
        </h1>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createProject()}
            placeholder="New project name"
            className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-sm border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          />
          <button
            onClick={createProject}
            className="px-4 py-2 text-sm rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1 text-sm">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="block px-3 py-2 rounded-md hover:bg-neutral-900 transition-colors"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
        Select a project.
      </div>
    </div>
  );
}

