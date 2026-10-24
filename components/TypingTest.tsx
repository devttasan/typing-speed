"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { generateWords } from "@/lib/words";
import { accuracy, countChars, rawWpm, wpm } from "@/lib/stats";
import { useTimer } from "@/hooks/useTimer";
import { Word } from "./Word";
import { Caret } from "./Caret";
import { Results } from "./Results";
import type { Point } from "./WpmChart";

const MODES = [15, 30, 60] as const;
type Mode = (typeof MODES)[number];
type Status = "idle" | "running" | "finished";

const MAX_EXTRA = 8;

export function TypingTest() {
  const [mode, setMode] = useState<Mode>(30);
  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [keys, setKeys] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState<Point[]>([]);
  const [isBest, setIsBest] = useState(false);

  const [caret, setCaret] = useState({ x: 0, y: 0, h: 40 });
  const [scroll, setScroll] = useState(0);

  const innerRef = useRef<HTMLDivElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);

  // latest state for the timer callbacks
  const live = useRef({ words, typed, wordIndex, keys });
  live.current = { words, typed, wordIndex, keys };

  const timer = useTimer({
    duration: mode,
    onTick: (elapsed) => {
      const { words, typed, wordIndex } = live.current;
      const chars = countChars(words, typed, wordIndex);
      setHistory((h) => [
        ...h,
        { second: elapsed, wpm: wpm(chars.correct, elapsed), raw: rawWpm(chars.typed, elapsed) },
      ]);
    },
    onFinish: () => {
      setStatus("finished");
      const { words, typed, wordIndex } = live.current;
      const final = wpm(countChars(words, typed, wordIndex).correct, mode);
      setIsBest(saveBest(mode, final));
    },
  });

  const { reset } = timer;

  const restart = useCallback(() => {
    reset();
    setWords(generateWords(60));
    setTyped([]);
    setWordIndex(0);
    setStatus("idle");
    setKeys({ correct: 0, total: 0 });
    setHistory([]);
    setIsBest(false);
    restartRef.current?.blur();
  }, [reset]);

  // new words on mount and whenever the mode changes
  useEffect(() => {
    restart();
  }, [restart]);

  // keep enough words for fast typists
  useEffect(() => {
    if (words.length > 0 && wordIndex > words.length - 20) {
      setWords((w) => [...w, ...generateWords(40)]);
    }
  }, [wordIndex, words.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        e.preventDefault();
        restartRef.current?.focus();
        return;
      }
      if (status === "finished" || e.metaKey || e.ctrlKey || e.altKey) return;

      const word = words[wordIndex] ?? "";
      const current = typed[wordIndex] ?? "";

      if (e.key === "Backspace") {
        e.preventDefault();
        if (current.length > 0) {
          setTyped((t) => withWord(t, wordIndex, current.slice(0, -1)));
        } else if (wordIndex > 0 && typed[wordIndex - 1] !== words[wordIndex - 1]) {
          setWordIndex((i) => i - 1);
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (current.length === 0) return;
        setKeys((k) => ({
          correct: k.correct + (current === word ? 1 : 0),
          total: k.total + 1,
        }));
        setWordIndex((i) => i + 1);
        return;
      }

      if (e.key.length !== 1) return;
      if (current.length >= word.length + MAX_EXTRA) return;

      if (status === "idle") {
        setStatus("running");
        timer.start();
      }

      const isCorrect = word[current.length] === e.key;
      setKeys((k) => ({ correct: k.correct + (isCorrect ? 1 : 0), total: k.total + 1 }));
      setTyped((t) => withWord(t, wordIndex, current + e.key));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, words, typed, wordIndex, timer]);

  // move the caret and scroll lines
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const wordEl = inner?.querySelector<HTMLElement>(`[data-word="${wordIndex}"]`);
    if (!inner || !wordEl) return;

    const letters = wordEl.querySelectorAll<HTMLElement>("[data-char]");
    const pos = (typed[wordIndex] ?? "").length;
    const target = letters[Math.min(pos, letters.length - 1)];
    if (!target) return;

    const atEnd = pos >= letters.length || target.dataset.char === "end";
    const x = target.offsetLeft + (atEnd && pos > 0 ? target.offsetWidth : 0);

    setCaret({ x, y: wordEl.offsetTop + 4, h: wordEl.offsetHeight - 10 });
    setScroll(Math.max(0, wordEl.offsetTop - wordEl.offsetHeight));
  }, [typed, wordIndex, words]);

  const chars = countChars(words, typed, wordIndex);
  const elapsed = mode - timer.timeLeft;

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <div className="flex items-center justify-between text-sub">
        <div className="flex gap-4">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={(e) => {
                setMode(m);
                e.currentTarget.blur();
              }}
              className={`transition-colors outline-none hover:text-text ${m === mode ? "text-accent" : ""}`}
            >
              {m}s
            </button>
          ))}
        </div>
        {status === "running" && (
          <div className="flex gap-6 text-2xl">
            <span className="text-accent">{timer.timeLeft}</span>
            <span>{wpm(chars.correct, elapsed)} wpm</span>
          </div>
        )}
      </div>

      {status === "finished" ? (
        <Results
          wpm={wpm(chars.correct, mode)}
          raw={rawWpm(chars.typed, mode)}
          accuracy={accuracy(keys.correct, keys.total)}
          chars={chars}
          seconds={mode}
          history={history}
          isBest={isBest}
        />
      ) : (
        <div className="relative h-[8.4rem] overflow-hidden text-[2rem] leading-[2.8rem]">
          <div
            ref={innerRef}
            className="relative transition-transform duration-150"
            style={{ transform: `translateY(-${scroll}px)` }}
          >
            <Caret x={caret.x} y={caret.y} height={caret.h} idle={status === "idle"} />
            {words.map((word, i) => (
              <Word
                key={i}
                word={word}
                typed={typed[i] ?? ""}
                index={i}
                isActive={i === wordIndex}
                isDone={i < wordIndex}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-sm text-sub">
        <button
          ref={restartRef}
          onClick={restart}
          aria-label="Restart test"
          className="rounded-md px-4 py-2 text-xl transition-colors hover:text-text focus:bg-text focus:text-bg focus:outline-none"
        >
          ↻
        </button>
        <p>
          <kbd className="rounded bg-sub/20 px-1.5 py-0.5 text-text">tab</kbd> +{" "}
          <kbd className="rounded bg-sub/20 px-1.5 py-0.5 text-text">enter</kbd> — restart
        </p>
      </div>
    </div>
  );
}

function withWord(list: string[], index: number, value: string) {
  const next = [...list];
  next[index] = value;
  return next;
}

function saveBest(mode: number, score: number): boolean {
  try {
    const key = `devtasan-best-${mode}`;
    const best = Number(localStorage.getItem(key) ?? 0);
    if (score > best) {
      localStorage.setItem(key, String(score));
      return best > 0;
    }
  } catch {
    // storage unavailable
  }
  return false;
}
