import api from './api';
import { demoStore, isDemoMode } from './demo';
import type { LearningNote } from '../types';

export interface LearningNoteCreateInput {
  title: string;
  content: string;
  topic?: string;
}

export interface LearningNoteUpdateInput {
  title?: string;
  content?: string;
  topic?: string | null;
}

export async function listNotes(projectId: string): Promise<LearningNote[]> {
  if (isDemoMode()) return demoStore.listNotes(projectId);
  const res = await api.get(`/projects/${projectId}/learning-notes`);
  return res.data as LearningNote[];
}

export async function createNote(projectId: string, data: LearningNoteCreateInput): Promise<LearningNote> {
  if (isDemoMode()) return demoStore.createNote(projectId, data);
  const res = await api.post(`/projects/${projectId}/learning-notes`, data);
  return res.data as LearningNote;
}

export async function updateNote(noteId: string, patch: LearningNoteUpdateInput): Promise<LearningNote> {
  if (isDemoMode()) return demoStore.updateNote(noteId, patch);
  const res = await api.patch(`/learning-notes/${noteId}`, patch);
  return res.data as LearningNote;
}

export async function deleteNote(noteId: string): Promise<void> {
  if (isDemoMode()) return demoStore.deleteNote(noteId);
  await api.delete(`/learning-notes/${noteId}`);
}
