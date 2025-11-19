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
    <div className="prism-wrapper m-4">
      <div className="flex h-full prism-border rounded-lg overflow-hidden">
        <div className="w-80 glass-card border-r border-white/30 p-4 space-y-4 rounded-l-lg">
        <h1 className="text-base font-semibold flex items-center gap-2 text-slate-700">
          <Folder className="w-4 h-4" />
          Projects
        </h1>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createProject()}
            placeholder="New project name"
            className="flex-1 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 text-sm border border-white/50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          />
          <button
            onClick={createProject}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1 text-sm">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="block px-3 py-2 rounded-lg hover:bg-white/60 transition-colors text-slate-700"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select a project.
        </div>
      </div>
    </div>
  );
}

