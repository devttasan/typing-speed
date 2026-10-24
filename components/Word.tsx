type Props = {
  word: string;
  typed: string;
  index: number;
  isActive: boolean;
  isDone: boolean;
};

export function Word({ word, typed, index, isActive, isDone }: Props) {
  const extra = typed.slice(word.length);
  const hasError = isDone && typed !== word;

  return (
    <span
      data-word={index}
      className={`mr-[0.6em] inline-block border-b-2 ${
        hasError ? "border-error/70" : "border-transparent"
      }`}
    >
      {word.split("").map((char, i) => {
        const input = typed[i];
        let color = "text-sub";
        if (input !== undefined) color = input === char ? "text-text" : "text-error";
        else if (isDone) color = "text-sub/60";

        return (
          <span key={i} data-char={i} className={`${color} transition-colors duration-75`}>
            {char}
          </span>
        );
      })}
      {extra.split("").map((char, i) => (
        <span
          key={`x${i}`}
          data-char={word.length + i}
          className="text-error/60"
        >
          {char}
        </span>
      ))}
      {isActive && typed.length === 0 && <span data-char="end" />}
    </span>
  );
}
