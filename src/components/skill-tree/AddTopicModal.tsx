// src/components/skill-tree/AddTopicModal.tsx
"use client";
import { useState } from "react";

interface AddTopicModalProps {
  isOpen: boolean; onClose: () => void;
  onSubmit: (topic: { title: string; subject: string; difficulty: number; description: string }) => void;
}
const inputCls = "mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-2 placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function AddTopicModal({ isOpen, onClose, onSubmit }: AddTopicModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("math");
  const [difficulty, setDifficulty] = useState(1);
  const [description, setDescription] = useState("");
  if (!isOpen) return null;
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), subject, difficulty, description: description.trim() });
    setTitle(""); setSubject("math"); setDifficulty(1); setDescription("");
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
        <h2 className="font-serif text-xl text-text">Add a New Topic</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="topic-title" className="block text-sm font-medium text-text-2">Title</label>
            <input id="topic-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Linear Algebra" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="topic-subject" className="block text-sm font-medium text-text-2">Subject</label>
            <select id="topic-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
              <option value="math">Math</option><option value="physics">Physics</option>
              <option value="cs">Computer Science</option><option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>
          <div>
            <label htmlFor="topic-difficulty" className="block text-sm font-medium text-text-2">Difficulty (1-5)</label>
            <input id="topic-difficulty" type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={"mt-1 w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"} />
          </div>
          <div>
            <label htmlFor="topic-description" className="block text-sm font-medium text-text-2">Description</label>
            <textarea id="topic-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief concept overview..." rows={3} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-text-3 hover:bg-surface">Cancel</button>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Add Topic</button>
          </div>
        </form>
      </div>
    </div>
  );
}
