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

  const hintText = word.split("").map((char, i) => char === " " ? " " : revealedPositions.has(i) ? char : "_").join("");

  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap" role="status" aria-label={`Word hint: ${hintText}`}>
      {word.split("").map((char, i) => {
        if (char === " ") {
          return <span key={i} className="w-2 sm:w-3" aria-hidden="true" />;
        }
        const revealed = revealedPositions.has(i);
        return (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-5 h-7 sm:w-7 sm:h-9 border-b-2 font-body font-bold text-sm sm:text-lg ${
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
