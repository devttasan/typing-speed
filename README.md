# typing test · devtasan

A typing speed test built with Next.js, React, TypeScript and Tailwind CSS — no UI or chart libraries.
Built for **devtasan · Build & Chill Ep. 01** (ASMR Programming, no talking).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- Random words from a built-in list, more words load as you type
- Letter-by-letter correct / incorrect / extra states
- Smooth sliding caret
- 15 / 30 / 60 second modes, the timer starts on the first key
- Live WPM, final WPM, raw WPM, accuracy and character breakdown
- Animated WPM-over-time chart drawn with plain SVG
- `tab` + `enter` to restart
- Personal best per mode (localStorage)

## Structure

```text
app/            layout, page, theme (globals.css)
components/     TypingTest, Word, Caret, Results, WpmChart
hooks/          useTimer
lib/            words, stats (wpm, raw wpm, accuracy, char counts)
```

WPM uses the standard 5 characters = 1 word.
