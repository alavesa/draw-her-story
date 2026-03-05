import { useRef, useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { motion } from "framer-motion";

export default function WordHint() {
  const { state, isMultiplayer, wordHint } = useGameState();
  const [prevHintCount, setPrevHintCount] = useState(0);
  const isFirstRender = useRef(true);

  // In multiplayer, use server-provided wordHint string
  // In local mode, compute from the actual word
  const word = state.currentWord?.word ?? "";

  // For multiplayer, parse the hint string from server (format: "_ _ r _ _   _ _ _")
  // For local, compute as before
  const isLocal = !isMultiplayer;

  const totalChars = isLocal ? word.replace(/\s/g, "").length : 0;
  const hintsToShow = isLocal && totalChars > 0 ? Math.min(state.revealedHints, Math.floor(totalChars * 0.6)) : 0;

  const hasNewHints = isLocal && hintsToShow > prevHintCount && !isFirstRender.current;

  useEffect(() => {
    isFirstRender.current = false;
    if (isLocal) setPrevHintCount(hintsToShow);
  }, [hintsToShow, isLocal]);

  // In multiplayer with no hint string yet, show nothing
  if (isMultiplayer && !wordHint) return null;
  // In local with no word, show nothing
  if (isLocal && !state.currentWord) return null;

  if (isMultiplayer && wordHint) {
    // Parse server hint: characters separated by spaces, double-space = word break
    // Server format: "_ _ r _ _   _ _ _" (each char/underscore separated by space, double space = word gap)
    const segments = wordHint.split("  "); // split on double space for word boundaries
    return (
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap" role="status" aria-label={`Word hint: ${wordHint}`}>
        {segments.map((segment, si) => (
          <span key={si} className="contents">
            {si > 0 && <span className="w-2 sm:w-3" aria-hidden="true" />}
            {segment.split(" ").filter(Boolean).map((ch, ci) => {
              const revealed = ch !== "_";
              return (
                <motion.span
                  key={`${si}-${ci}-${revealed}`}
                  initial={revealed ? { rotateX: 90, opacity: 0 } : false}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ perspective: 400 }}
                  className={`inline-flex items-center justify-center w-5 h-7 sm:w-7 sm:h-9 border-b-2 font-body font-bold text-sm sm:text-lg ${
                    revealed ? "border-accent text-accent bg-accent/10" : "border-muted-foreground/30 text-transparent bg-secondary"
                  }`}
                >
                  {revealed ? ch : "_"}
                </motion.span>
              );
            })}
          </span>
        ))}
      </div>
    );
  }

  // Local mode: compute hints from word
  const charIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== " ") {
      charIndices.push(i);
    }
  }

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
