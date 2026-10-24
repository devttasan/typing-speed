import type { CharStats } from "@/lib/stats";
import { WpmChart, type Point } from "./WpmChart";

type Props = {
  wpm: number;
  raw: number;
  accuracy: number;
  chars: CharStats;
  seconds: number;
  history: Point[];
  isBest: boolean;
};

export function Results({ wpm, raw, accuracy, chars, seconds, history, isBest }: Props) {
  return (
    <div className="animate-fade-in grid gap-8 md:grid-cols-[180px_1fr]">
      <div className="flex flex-col gap-6">
        <Stat label="wpm" value={wpm} big />
        <Stat label="acc" value={`${accuracy}%`} big />
        {isBest && <span className="text-sm text-accent">new personal best ▌</span>}
      </div>

      <div className="flex flex-col gap-6">
        <WpmChart points={history} />
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="raw" value={raw} />
          <Stat
            label="characters"
            value={`${chars.correct}/${chars.incorrect}/${chars.extra}/${chars.missed}`}
          />
          <Stat label="time" value={`${seconds}s`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string | number; big?: boolean }) {
  return (
    <div>
      <div className="text-sm text-sub">{label}</div>
      <div className={big ? "text-6xl leading-none text-accent" : "text-2xl text-text"}>
        {value}
      </div>
    </div>
  );
}
