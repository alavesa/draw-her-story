import { useGame } from "@/context/GameContext";

export default function WordHint() {
  const { state } = useGame();
  if (!state.currentWord) return null;

  const word = state.currentWord.word;
  const totalChars = word.replace(/\s/g, "").length;
  const hintsToShow = Math.min(state.revealedHints, Math.floor(totalChars * 0.6));

  // Determine which character indices to reveal
  const charIndices: number[] = [];
  let idx = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== " ") {
      charIndices.push(i);
      idx++;
    }
  }

  // Spread hints evenly
  const revealedPositions = new Set<number>();
  if (hintsToShow > 0) {
    const step = Math.max(1, Math.floor(charIndices.length / hintsToShow));
    for (let i = 0; i < hintsToShow && i < charIndices.length; i++) {
      revealedPositions.add(charIndices[Math.min(i * step, charIndices.length - 1)]);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {word.split("").map((char, i) => {
        if (char === " ") {
          return <span key={i} className="w-3" />;
        }
        const revealed = revealedPositions.has(i);
        return (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-7 h-9 rounded border-b-2 font-body font-bold text-lg ${
              revealed ? "border-accent text-accent bg-accent/10" : "border-muted-foreground/30 text-transparent bg-secondary"
            }`}
          >
            {revealed ? char : "_"}
          </span>
        );
      })}
    </div>
  );
}
