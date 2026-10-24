// 5 characters = 1 word
export const wpm = (correctChars: number, seconds: number) =>
  seconds <= 0 ? 0 : Math.round(correctChars / 5 / (seconds / 60));

export const rawWpm = (typedChars: number, seconds: number) =>
  seconds <= 0 ? 0 : Math.round(typedChars / 5 / (seconds / 60));

export const accuracy = (correctKeystrokes: number, totalKeystrokes: number) =>
  totalKeystrokes === 0
    ? 100
    : Math.round((correctKeystrokes / totalKeystrokes) * 100);

export type CharStats = {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  typed: number;
};

export function countChars(
  words: string[],
  typed: string[],
  wordIndex: number,
): CharStats {
  const stats: CharStats = { correct: 0, incorrect: 0, extra: 0, missed: 0, typed: 0 };

  for (let i = 0; i <= wordIndex; i++) {
    const word = words[i] ?? "";
    const input = typed[i] ?? "";
    const done = i < wordIndex;

    for (let j = 0; j < input.length; j++) {
      if (j >= word.length) stats.extra++;
      else if (input[j] === word[j]) stats.correct++;
      else stats.incorrect++;
    }

    stats.typed += input.length;

    if (done) {
      stats.typed += 1; // the space
      if (input === word) stats.correct += 1;
      stats.missed += Math.max(0, word.length - input.length);
    }
  }

  return stats;
}
