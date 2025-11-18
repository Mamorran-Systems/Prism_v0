'use client';

import { useState, useRef, useEffect } from 'react';
import type { Step, Revision } from '@prisma/client';
import { Tool } from '@/lib/config';
import { ArrowUpRight, Bookmark } from 'lucide-react';

interface Props {
  runId: string;
  projectId: string;
  projectName: string;
  runName: string;
  initialSteps: Step[];
  initialRevisions: Revision[];
}

export default function RunClient(props: Props) {
  const [steps, setSteps] = useState<Step[]>(props.initialSteps);
  const [revisions, setRevisions] = useState<Revision[]>(props.initialRevisions);
  const [tool, setTool] = useState<Tool>('gpt-4.1');
  const [prompt, setPrompt] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  async function sendStep() {
    if (!prompt.trim()) return;
    const res = await fetch('/api/steps', {
      method: 'POST',
      body: JSON.stringify({
        runId: props.runId,
        tool,
        track: tool === 'manual' ? 'MANUAL' : 'AI',
        prompt,
        manualResponse: tool === 'manual' ? prompt : undefined,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const step = (await res.json()) as Step;
    setSteps((prev) => [...prev, step]);
    setPrompt('');
  }

  async function saveRevision() {
    if (!label.trim()) return;
    const res = await fetch('/api/revisions', {
      method: 'POST',
      body: JSON.stringify({
        runId: props.runId,
        label,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const rev = (await res.json()) as Revision;
    setRevisions((prev) => [rev, ...prev]);
    setLabel('');
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-neutral-800 p-4 space-y-2">
        <div className="text-xs text-neutral-500">{props.projectName}</div>
        <div className="text-sm font-semibold">{props.runName}</div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-neutral-800 p-3 flex gap-2 items-center">
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value as Tool)}
            className="text-xs bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          >
            <option value="gpt-4.1">gpt-4.1</option>
            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
            <option value="manual">manual</option>
          </select>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendStep())}
            placeholder="Prompt or manual note"
            className="flex-1 text-sm bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          />
          <button
            onClick={sendStep}
            className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center gap-1"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Send
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 border-r border-neutral-800 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto text-sm">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`border-b border-neutral-900 px-4 py-3 cursor-pointer transition-colors ${
                    selectedStepIndex === s.index
                      ? 'bg-neutral-900 border-l-2 border-l-blue-500'
                      : 'hover:bg-neutral-900/50'
                  }`}
                  onClick={() => setSelectedStepIndex(s.index)}
                >
                  <div className="flex justify-between text-xs text-neutral-500 mb-2">
                    <span>
                      #{s.index} · {s.tool} · {s.track}
                    </span>
                    <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-neutral-300 whitespace-pre-wrap mb-2">
                    <strong>Prompt:</strong> {s.prompt}
                  </div>
                  {s.response && (
                    <div className="text-neutral-400 whitespace-pre-wrap">
                      <strong>Response:</strong> {s.response.slice(0, 600)}
                      {s.response.length > 600 ? '…' : ''}
                    </div>
                  )}
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>
          </div>

          <div className="w-72 flex flex-col overflow-hidden">
            <div className="border-b border-neutral-800 p-3 space-y-2">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Revisions
              </div>
              <div className="flex gap-1.5">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveRevision())}
                  placeholder="Label"
                  className="flex-1 text-xs bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                />
                <button
                  onClick={saveRevision}
                  className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto text-xs">
              {revisions.map((r) => (
                <div key={r.id} className="border-b border-neutral-900 px-3 py-2.5">
                  <div className="font-medium text-neutral-200">{r.label}</div>
                  <div className="text-neutral-500 text-xs mt-0.5">
                    up to step #{r.stepIndex} · {new Date(r.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="mt-1.5 text-neutral-400 whitespace-pre-wrap text-xs leading-relaxed">
                    {r.summary}
                  </div>
                </div>
              ))}
              {revisions.length === 0 && (
                <div className="px-3 py-2.5 text-neutral-600 text-xs">No revisions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

