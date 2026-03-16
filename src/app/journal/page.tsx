// src/app/journal/page.tsx
export default function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Learning Journal</h1>
      <p className="mt-2 text-ink-muted">Your session history, auto-generated summaries, and reflections on what clicked and what needs more work.</p>
      <div className="mt-8 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-tan-dark bg-parchment">
        <p className="font-hand text-xl text-ink-muted">Session entries will appear here...</p>
      </div>
    </div>
  );
}
