import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  duration: number;
  onTick: (elapsed: number) => void;
  onFinish: () => void;
};

export function useTimer({ duration, onTick, onFinish }: Options) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);

  const onTickRef = useRef(onTick);
  const onFinishRef = useRef(onFinish);
  onTickRef.current = onTick;
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const elapsed = duration - timeLeft;
    if (elapsed > 0) onTickRef.current(elapsed);
    if (timeLeft <= 0) {
      setRunning(false);
      onFinishRef.current();
    }
  }, [timeLeft, running, duration]);

  const start = useCallback(() => setRunning(true), []);

  const reset = useCallback(() => {
    setRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  return { timeLeft, running, start, reset };
}
