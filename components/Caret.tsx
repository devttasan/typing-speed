type Props = {
  x: number;
  y: number;
  height: number;
  idle: boolean;
};

export function Caret({ x, y, height, idle }: Props) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-0 top-0 w-[3px] rounded-full bg-accent ${
        idle ? "animate-blink" : ""
      }`}
      style={{
        height,
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 80ms ease-out",
      }}
    />
  );
}
