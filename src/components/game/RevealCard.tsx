import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const categoryEmojis: Record<string, string> = {
  Science: "🔬",
  Arts: "🎨",
  Sports: "🏆",
  Activism: "✊",
  Politics: "⚖️",
  Literature: "📚",
  Exploration: "🚀",
};

export default function RevealCard() {
  const { state, dispatch } = useGame();
  if (!state.currentWord) return null;

  const { woman, category, word, bio } = state.currentWord;
  const isLastRound = state.currentArtistIndex >= state.players.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="gradient-reveal p-4 sm:p-6 md:p-8 text-center shadow-elevated">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="mx-auto mb-3 text-pink-300" size={32} aria-hidden="true" />
          </motion.div>
          <p className="text-purple-200 text-sm font-body uppercase tracking-widest mb-2">Did You Know?</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{woman}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-foreground/10 text-primary-foreground/80 text-sm font-body mb-4">
            <span aria-hidden="true">{categoryEmojis[category] || "✨"}</span>
            <span>{category}</span>
          </div>
          <div className="bg-primary-foreground/10 p-3 sm:p-4 mb-4">
            <p className="text-primary-foreground/60 text-xs uppercase tracking-wider mb-1">The word was</p>
            <p className="font-display text-xl font-semibold text-pink-300">"{word}"</p>
          </div>
          <p className="text-primary-foreground/85 font-body text-sm leading-relaxed mb-6">{bio}</p>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-semibold text-primary-foreground">Scores</h3>
            <div className="space-y-2 mb-4">
              {[...state.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-foreground/10">
                  <span className="text-primary-foreground text-sm font-body">{i === 0 ? "👑" : ""} {p.name}</span>
                  <span className="text-pink-300 font-bold font-body">{p.score}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => dispatch({ type: isLastRound ? "SHOW_RESULTS" : "NEXT_ROUND" })}
              className="gradient-pink text-accent-foreground font-body font-bold py-3 px-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLastRound ? "See Final Results" : "Next Round"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
