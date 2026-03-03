import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Trophy, Share2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categoryEmojis: Record<string, string> = {
  Science: "🔬", Arts: "🎨", Sports: "🏆", Activism: "✊", Politics: "⚖️", Literature: "📚", Exploration: "🚀",
};

function getRank(sorted: { score: number }[], index: number): number {
  if (index === 0) return 1;
  return sorted[index].score === sorted[index - 1].score
    ? getRank(sorted, index - 1)
    : index + 1;
}

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const isTie = sorted.length >= 2 && sorted[0].score === sorted[1].score;
  const discoveredWomen = state.guessedWords.length > 0 ? state.guessedWords : state.usedWords;

  const handleShare = async () => {
    const womenNames = discoveredWomen.map(w => w.woman).join(", ");
    const scoreLines = sorted.map(p => `${p.name}: ${p.score} pts`).join(", ");
    const text = `We played Draw Her Story for #IWD! 🎨🟣 ${scoreLines}. We celebrated ${womenNames}!`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Trophy className="mx-auto text-accent mb-3" size={48} aria-hidden="true" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Final Results</h1>
          <p className="text-muted-foreground font-body">
            {isTie ? "It's a tie — what a close game!" : "What an incredible game!"}
          </p>
        </motion.div>

        <div className="space-y-3 mb-10" role="list" aria-label="Player rankings">
          {sorted.map((player, i) => {
            const rank = getRank(sorted, i);
            const isWinner = rank === 1;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border ${isWinner ? "gradient-primary text-primary-foreground border-transparent shadow-elevated" : "bg-card border-border shadow-card"}`}
              >
                <span className={`text-2xl font-display font-bold ${isWinner ? "text-pink-300" : "text-muted-foreground"}`}>
                  {isWinner ? "👑" : `#${rank}`}
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm" style={{ backgroundColor: player.color + "33", color: player.color }}>
                  {player.name[0].toUpperCase()}
                </div>
                <span className={`flex-1 font-body font-semibold ${isWinner ? "" : "text-foreground"}`}>{player.name}</span>
                <span className={`font-body font-bold text-xl ${isWinner ? "text-pink-300" : "text-accent"}`}>{player.score} pts</span>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-accent" size={20} aria-hidden="true" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Women You Discovered</h2>
          </div>
          {discoveredWomen.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No words were guessed correctly this game.</p>
          ) : (
            <div className="grid gap-3">
              {discoveredWomen.map((entry, i) => (
                <motion.div
                  key={entry.word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-3 sm:p-4 bg-card border border-border shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">{categoryEmojis[entry.category] || "✨"}</span>
                    <div>
                      <h3 className="font-display font-bold text-foreground">{entry.woman}</h3>
                      <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">{entry.category} · "{entry.word}"</span>
                      <p className="text-sm text-muted-foreground font-body mt-1">{entry.bio}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <button onClick={handleShare} className="gradient-pink text-accent-foreground font-body font-bold py-3 px-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Share2 size={18} aria-hidden="true" /> Share Results
          </button>
          <button onClick={() => dispatch({ type: "RESET" })} className="bg-secondary text-secondary-foreground font-body font-bold py-3 px-6 hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={18} aria-hidden="true" /> Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
