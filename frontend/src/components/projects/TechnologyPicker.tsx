import { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import * as techService from '../../services/technologies';
import type { Technology, TechnologyInfo } from '../../types';

interface Props {
  projectId: string;
  technologies: TechnologyInfo[];
  onChanged: () => void;
}

export default function TechnologyPicker({ projectId, technologies, onChanged }: Props) {
  const { showError } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allTechs, setAllTechs] = useState<Technology[] | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && allTechs === null) {
      techService.listTechnologies()
        .then(setAllTechs)
        .catch(() => setAllTechs([]));
    }
    if (open) inputRef.current?.focus();
  }, [open, allTechs]);

  const attachedNames = new Set(technologies.map((t) => t.name.toLowerCase()));
  const trimmedQuery = query.trim();
  const filtered = (allTechs ?? []).filter(
    (t) => t.name.toLowerCase().includes(trimmedQuery.toLowerCase()),
  );
  const exactMatch = (allTechs ?? []).some(
    (t) => t.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  const run = async (action: () => Promise<void>, failMessage: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      onChanged();
    } catch {
      showError(failMessage);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (tech: Technology) => run(async () => {
    if (attachedNames.has(tech.name.toLowerCase())) {
      await techService.detachTechnology(projectId, tech.id);
    } else {
      await techService.attachTechnology(projectId, tech.id);
    }
  }, 'Failed to update tech stack');

  const createAndAttach = () => run(async () => {
    const created = await techService.createTechnology(trimmedQuery);
    setAllTechs((prev) => (prev ? [...prev, created] : [created]));
    await techService.attachTechnology(projectId, created.id);
    setQuery('');
  }, 'Failed to add technology');

  const detachChip = (tech: TechnologyInfo) =>
    run(() => techService.detachTechnology(projectId, tech.id), 'Failed to remove technology');

  return (
    <div>
      <p className="text-sm text-app-text-muted mb-2">Tech Stack</p>
      <div className="flex flex-wrap gap-1.5">
        {technologies.map((tech) => (
          <span
            key={tech.id}
            className="group/chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-tech)] border border-app-border text-app-text-secondary"
          >
            {tech.name}
            <button
              onClick={() => detachChip(tech)}
              aria-label={`Remove ${tech.name}`}
              className="opacity-0 group-hover/chip:opacity-100 focus-visible:opacity-100 text-app-text-muted hover:text-danger transition-opacity"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-tech)] border border-dashed border-app-border text-app-text-muted hover:text-accent hover:border-accent/50 transition-colors"
          >
            <Plus size={11} /> Add
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-app-border bg-app-surface shadow-xl z-20 overflow-hidden">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or create..."
                className="w-full px-3 py-2 bg-transparent border-b border-app-border text-sm text-app-text placeholder:text-app-text-muted focus:outline-none"
              />
              <div className="max-h-48 overflow-y-auto py-1">
                {filtered.map((tech) => {
                  const attached = attachedNames.has(tech.name.toLowerCase());
                  return (
                    <button
                      key={tech.id}
                      onClick={() => toggle(tech)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-app-text-secondary hover:bg-app-hover hover:text-app-text transition-colors"
                    >
                      <span className="flex-1 text-left truncate">{tech.name}</span>
                      {tech.category && (
                        <span className="text-[10px] text-app-text-muted">{tech.category}</span>
                      )}
                      {attached && <Check size={13} className="text-accent shrink-0" />}
                    </button>
                  );
                })}
                {trimmedQuery && !exactMatch && (
                  <button
                    onClick={createAndAttach}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-accent hover:bg-app-hover transition-colors"
                  >
                    <Plus size={13} className="shrink-0" />
                    <span className="truncate">Create "{trimmedQuery}"</span>
                  </button>
                )}
                {!trimmedQuery && filtered.length === 0 && allTechs !== null && (
                  <p className="px-3 py-2 text-xs text-app-text-muted">Type to create a technology</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
