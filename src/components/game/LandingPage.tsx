import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import heroWomen from "@/assets/hero-women.png";

export default function LandingPage() {
  const { dispatch } = useGame();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const canPlay = name1.trim() && name2.trim() && name1.trim() !== name2.trim();

  const handleStart = () => {
    if (!canPlay) return;
    dispatch({ type: "CREATE_ROOM", playerName: name1.trim() });
    dispatch({ type: "JOIN_ROOM", playerName: name2.trim() });
    dispatch({ type: "START_GAME" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Full-screen hero background */}
      <motion.img
        src={heroWomen}
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.8 }}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 gradient-primary blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 gradient-pink blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* IWD Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 gradient-primary text-primary-foreground text-xs font-body font-semibold tracking-wider uppercase mb-6"
        >
          <Sparkles size={14} aria-hidden="true" />
          International Women's Day
        </motion.div>

        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-foreground mb-3 leading-tight">
          Draw Her <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Story</span>
        </h1>

        <p className="font-body text-foreground/70 text-base sm:text-lg font-medium mb-2">
          Sketch, Guess, and Celebrate the Women Who Changed the World
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-card/80 border border-border backdrop-blur-sm mb-8">
          <span className="font-body font-semibold text-foreground text-xs sm:text-sm">2 players or teams</span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="text-muted-foreground font-body text-xs sm:text-sm">1 device · 1 round each · One draws, one guesses</span>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="player1-name" className="block text-xs font-body font-semibold text-foreground/60 uppercase tracking-wider mb-1">Player / Team 1</label>
            <input
              id="player1-name"
              type="text"
              placeholder="Enter name"
              value={name1}
              onChange={e => setName1(e.target.value)}
              maxLength={16}
              className="w-full px-5 py-3 border border-input bg-card text-foreground font-body text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring shadow-card"
            />
          </div>
          <div>
            <label htmlFor="player2-name" className="block text-xs font-body font-semibold text-foreground/60 uppercase tracking-wider mb-1">Player / Team 2</label>
            <input
              id="player2-name"
              type="text"
              placeholder="Enter name"
              value={name2}
              onChange={e => setName2(e.target.value)}
              maxLength={16}
              className="w-full px-5 py-3 border border-input bg-card text-foreground font-body text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring shadow-card"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!canPlay}
            className="w-full gradient-primary text-primary-foreground font-body font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
          >
            <Play size={20} />
            Play
          </button>
        </div>
      </motion.div>
    </div>
  );
}
