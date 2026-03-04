import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { categoryEmojis } from "@/data/categoryEmojis";
import { buttonTap, buttonHover } from "@/lib/animations";
import { playReveal } from "@/lib/sounds";

export default function RevealCard() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    playReveal();
  }, []);
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
        <div className="gradient-reveal p-4 sm:p-6 md:p-8 text-center shadow-elevated animate-pulse-glow relative overflow-hidden">
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            }}
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="mx-auto mb-3 text-accent-foreground/70 animate-float" size={32} aria-hidden="true" />
          </motion.div>
          <p className="text-primary-foreground/80 text-sm font-body uppercase tracking-widest mb-2">Did You Know?</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{woman}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-foreground/10 text-primary-foreground/80 text-sm font-body mb-4">
            <span aria-hidden="true">{categoryEmojis[category] || "✨"}</span>
            <span>{category}</span>
          </div>
          <div className="bg-primary-foreground/10 p-3 sm:p-4 mb-4">
            <p className="text-primary-foreground/60 text-xs uppercase tracking-wider mb-1">The word was</p>
            <p className="font-display text-xl font-semibold text-accent-foreground">"{word}"</p>
          </div>
          <p className="text-primary-foreground/85 font-body text-sm leading-relaxed mb-6">{bio}</p>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-semibold text-primary-foreground">Scores</h3>
            <div className="space-y-2 mb-4">
              {[...state.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-foreground/10"
                >
                  <span className="text-primary-foreground text-sm font-body">{i === 0 ? "👑" : ""} {p.name}</span>
                  <span className="text-accent-foreground font-bold font-body">{p.score}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={() => dispatch({ type: isLastRound ? "SHOW_RESULTS" : "NEXT_ROUND" })}
              className="gradient-pink text-accent-foreground font-body font-bold py-3 px-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLastRound ? "See Final Results" : "Next Round"}
              <ArrowRight size={18} aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
