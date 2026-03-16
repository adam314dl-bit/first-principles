// src/app/playground/page.tsx
export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Playground</h1>
      <p className="mt-2 text-ink-muted">Browse review challenges like a game menu — sorted by fun, not urgency.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">Teach It</h3>
          <p className="mt-1 text-sm text-ink-muted">Explain concepts simply to prove you understand them.</p>
        </div>
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">What If?</h3>
          <p className="mt-1 text-sm text-ink-muted">Counterfactual challenges that test deep understanding.</p>
        </div>
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">Connect</h3>
          <p className="mt-1 text-sm text-ink-muted">Bridge knowledge across topics and discover hidden links.</p>
        </div>
      </div>
    </div>
  );
}
