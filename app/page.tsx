import { TypingTest } from "@/components/TypingTest";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-8 py-10">
      <header className="flex w-full max-w-5xl items-center gap-3 text-2xl">
        <span className="text-text">
          dt<span className="text-accent">▌</span>
        </span>
        <span className="text-sub">typing test</span>
      </header>

      <TypingTest />

      <footer className="text-sm text-sub">soft clicks &amp; sharp code</footer>
    </main>
  );
}
