import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Note } from '../types';
import { getNotes, saveNotes } from '../utils/storage';
import { useAuth } from './AuthContext';

type NoteInput = { title?: string; text: string; category: Category };

interface NotesContextType {
  notes: Note[];
  addNote: (input: NoteInput) => Promise<void>;
  updateNote: (id: string, input: NoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  // Load every saved note once, when the app starts
  useEffect(() => {
    getNotes().then(setAllNotes);
  }, []);

  // Screens only ever see the logged-in user's notes
  const notes = user ? allNotes.filter((n) => n.userId === user.id) : [];

  async function persist(updated: Note[]) {
    setAllNotes(updated);
    await saveNotes(updated);
  }

  async function addNote(input: NoteInput) {
    if (!user) return;
    const note: Note = {
      id: Date.now().toString(),
      userId: user.id,
      title: input.title?.trim() || undefined,
      text: input.text.trim(),
      category: input.category,
      createdAt: new Date().toISOString(),
    };
    await persist([note, ...allNotes]);
  }

  async function updateNote(id: string, input: NoteInput) {
    const updated = allNotes.map((n) =>
      n.id === id
        ? {
            ...n,
            title: input.title?.trim() || undefined,
            text: input.text.trim(),
            category: input.category,
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    await persist(updated);
  }

  async function deleteNote(id: string) {
    await persist(allNotes.filter((n) => n.id !== id));
  }

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used inside a NotesProvider');
  return ctx;
}