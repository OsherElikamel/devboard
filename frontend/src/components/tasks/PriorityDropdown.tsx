import { useEffect, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { PRIORITIES } from './priority-constants';
import type { TaskPriority } from '../../types';

interface Props {
  priority: TaskPriority;
  onChange: (p: TaskPriority) => void;
}

export default function PriorityDropdown({ priority, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-[family-name:var(--font-tech)] border transition-colors hover:brightness-110 ${current.bg} ${current.color} ${current.border}`}
      >
        {current.label}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 py-1 rounded-xl border border-app-border bg-app-surface shadow-xl z-20 min-w-[110px]">
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={e => { e.stopPropagation(); onChange(p.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-app-hover transition-colors ${p.color}`}
            >
              <Flag size={11} />
              {p.label}
              {p.value === priority && <span className="ml-auto text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
