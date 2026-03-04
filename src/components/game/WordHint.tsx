import { useRef, useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";

export default function WordHint() {
  const { state } = useGame();
  const [prevHintCount, setPrevHintCount] = useState(0);
  const isFirstRender = useRef(true);

  const word = state.currentWord?.word ?? "";
  const totalChars = word.replace(/\s/g, "").length;
  const hintsToShow = totalChars > 0 ? Math.min(state.revealedHints, Math.floor(totalChars * 0.6)) : 0;

  // Track if new hints were just revealed
  const hasNewHints = hintsToShow > prevHintCount && !isFirstRender.current;

  // Update tracking after render — must be before any early return
  useEffect(() => {
    isFirstRender.current = false;
    setPrevHintCount(hintsToShow);
  }, [hintsToShow]);

  if (!state.currentWord) return null;

  // Determine which character indices to reveal
  const charIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== " ") {
      charIndices.push(i);
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
          <motion.span
            key={`${i}-${revealed}`}
            initial={revealed && hasNewHints ? { rotateX: 90, opacity: 0 } : false}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ perspective: 400 }}
            className={`inline-flex items-center justify-center w-5 h-7 sm:w-7 sm:h-9 border-b-2 font-body font-bold text-sm sm:text-lg ${
              revealed ? "border-accent text-accent bg-accent/10" : "border-muted-foreground/30 text-transparent bg-secondary"
            }`}
          >
            {revealed ? char : "_"}
          </motion.span>
        );
      })}
    </div>
  );
}
