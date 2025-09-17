"use client";

import JsonPlayground from "@/components/JsonPlayground";

export default function Page() {
  return (
    <main className="min-h-screen w-full px-6 py-10 md:py-14">
      <section className="mx-auto max-w-6xl w-full flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">JSON → UI Engine Playground</h1>
          <p className="text-muted-foreground max-w-3xl">
            Describe your UI with a simple JSON schema. The engine renders components, manages state, and wires API actions.
          </p>
        </header>

        <div className="rounded-lg border p-5 bg-card">
          <JsonPlayground />
        </div>

        <footer className="text-sm text-muted-foreground">
          Built for experimentation. See docs at <code className="px-1 py-0.5 rounded bg-muted">src/lib/README-ENGINE.md</code>.
        </footer>
      </section>
    </main>
  );
}