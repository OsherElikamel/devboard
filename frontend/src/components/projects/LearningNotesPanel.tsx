import { useEffect, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import * as notesService from '../../services/learningNotes';
import { timeAgo } from '../../utils/format';
import type { LearningNote } from '../../types';

interface Props {
  projectId: string;
}

export default function LearningNotesPanel({ projectId }: Props) {
  const { showError, showSuccess } = useToast();
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    notesService.listNotes(projectId)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setTitle('');
    setTopic('');
    setContent('');
  };

  const openCreate = () => {
    closeForm();
    setFormOpen(true);
  };

  const openEdit = (note: LearningNote) => {
    setFormOpen(true);
    setEditingId(note.id);
    setTitle(note.title);
    setTopic(note.topic || '');
    setContent(note.content);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await notesService.updateNote(editingId, {
          title: title.trim(),
          content: content.trim(),
          topic: topic.trim() || null,
        });
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      } else {
        const created = await notesService.createNote(projectId, {
          title: title.trim(),
          content: content.trim(),
          ...(topic.trim() ? { topic: topic.trim() } : {}),
        });
        setNotes(prev => [created, ...prev]);
        showSuccess('Note added');
      }
      closeForm();
    } catch {
      showError(editingId ? 'Failed to update note' : 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (noteId: string) => {
    setConfirmingDeleteId(null);
    try {
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (editingId === noteId) closeForm();
    } catch {
      showError('Failed to delete note');
    }
  };

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-app-text flex items-center gap-2">
            <BookOpen size={18} className="text-accent" /> Learning Notes
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-[family-name:var(--font-tech)] bg-accent/10 text-accent">
            {notes.length}
          </span>
        </div>
        {!formOpen && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border text-sm text-app-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
          >
            <Plus size={14} /> Add note
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={submit} className="px-6 py-4 border-b border-app-border space-y-3 bg-app-elevated/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-app-text">{editingId ? 'Edit note' : 'New note'}</p>
            <button type="button" onClick={closeForm} aria-label="Close note form" className="p-1 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What did you learn? *"
              required
              maxLength={200}
              className="sm:col-span-2 px-4 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Topic (e.g. Docker)"
              maxLength={100}
              className="px-4 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="The details — what clicked, what surprised you, what you'd do differently... *"
            required
            rows={3}
            maxLength={10000}
            className="w-full px-4 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl text-sm text-app-text-secondary hover:bg-app-hover transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add note'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-app-elevated animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 && !formOpen ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-app-text-muted">
            No learning notes yet — capture what you learned building this project.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-app-border">
          {notes.map(note => (
            <div key={note.id} className="px-6 py-4 hover:bg-app-hover/50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-app-text">{note.title}</h4>
                    {note.topic && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-[family-name:var(--font-tech)] border border-accent/30 bg-accent/10 text-accent">
                        {note.topic}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-app-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-app-text-muted mt-1.5 font-[family-name:var(--font-tech)]">{timeAgo(note.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {confirmingDeleteId === note.id ? (
                    <>
                      <button onClick={() => remove(note.id)} className="px-2 py-0.5 rounded-lg bg-danger/15 text-danger text-xs font-medium hover:bg-danger/25 transition-colors">
                        Delete
                      </button>
                      <button onClick={() => setConfirmingDeleteId(null)} className="px-2 py-0.5 rounded-lg text-app-text-muted text-xs hover:bg-app-hover transition-colors">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(note)}
                        aria-label={`Edit note "${note.title}"`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg text-app-text-muted hover:text-accent hover:bg-app-hover transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(note.id)}
                        aria-label={`Delete note "${note.title}"`}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg text-app-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
