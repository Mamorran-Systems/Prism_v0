'use client';

// @ts-nocheck

import { useState } from 'react';

type Step = {
  id?: string;
  index: number;
  tool: string;
  track: string;
  prompt: string;
  response: string;
};

type RunClientProps = {
  run: any;
  steps?: Step[];
  revisions?: any[];
  project?: any;
};

export default function RunClient(props: RunClientProps) {
  const { run, steps: initialSteps = [] } = props;

  const [tool, setTool] = useState<'gpt-4.1' | 'gpt-4.1-mini' | 'manual'>(
    'gpt-4.1'
  );
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const runId = run?.id;

  async function sendStep() {
    if (!prompt.trim()) return;
    if (!runId) {
      alert('Error: Run ID is missing');
      return;
    }

    if (tool === 'manual') {
      // Manual mode: no API call
      const nextIndex = steps.length + 1;
      const step: Step = {
        id: `local-${Date.now()}`,
        index: nextIndex,
        tool,
        track: 'MANUAL',
        prompt,
        response: prompt, // For manual, the prompt IS the response
      };
      setSteps((prev) => [...prev, step]);
      setPrompt('');
      return;
    }

    // AI mode: call API with error handling
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        body: JSON.stringify({
          runId,
          tool,
          track: 'AI',
          prompt,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let errorText = '';
        try {
          errorText = await res.text();
        } catch (e) {
          errorText = 'No error message available';
        }
        console.error('API error:', res.status, errorText);
        alert(`API Error ${res.status}: ${errorText}`);
        return;
      }

      let step: Step;
      try {
        const text = await res.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        step = JSON.parse(text) as Step;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        alert('Failed to parse server response. Check console for details.');
        return;
      }

      console.log('Step from API:', step);
      setSteps((prev) => [...prev, step]);
      setPrompt('');
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error}`);
    }
  }

  return (
    <div className="prism-wrapper m-2">
      <div className="flex h-screen flex-col prism-border rounded-lg">
        <div className="glass-card border-b border-white/30 p-4 flex items-center gap-3 rounded-t-lg">
          <div className="font-medium text-sm text-slate-700">
          {run?.name ?? 'Run'} ({runId ?? 'unknown'})
          </div>
          <select
          className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          value={tool}
          onChange={(e) => setTool(e.target.value as any)}
        >
          <option value="gpt-4.1">gpt-4.1</option>
          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          <option value="manual">manual</option>
        </select>
        <input
          className="flex-1 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          placeholder="Prompt…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={sendStep}
          className="px-4 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
        >
          Send
        </button>
      </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {steps.length === 0 && (
          <div className="text-slate-400 text-sm text-center py-8">No steps yet.</div>
          )}
          {steps.map((s) => (
          <div
            key={s.id ?? s.index}
            className="glass-card rounded-lg p-4 text-sm space-y-3 hover:bg-white/70 transition-colors"
          >
            <div className="text-xs text-slate-500 font-medium">
              #{s.index} · {s.tool} · {s.track}
            </div>
            <div>
              <div className="text-slate-600 text-xs mb-1.5 font-semibold">Prompt</div>
              <pre className="whitespace-pre-wrap text-slate-800 bg-white/40 rounded p-2 text-sm">
                {s.prompt}
              </pre>
            </div>
            <div>
              <div className="text-slate-600 text-xs mb-1.5 font-semibold">Response</div>
              <pre className="whitespace-pre-wrap text-slate-800 bg-white/40 rounded p-2 text-sm">
                {s.response}
              </pre>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
