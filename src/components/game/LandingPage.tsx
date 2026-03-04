import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Sparkles, UserPlus, X, Volume2, VolumeX } from "lucide-react";
import heroWomen from "@/assets/hero-women.png";
import { buttonTap, buttonGlowHover, buttonHover } from "@/lib/animations";
import { isSoundEnabled, setSoundEnabled, playClick } from "@/lib/sounds";

export default function LandingPage() {
  const { dispatch } = useGame();
  const [names, setNames] = useState(["", ""]);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const trimmed = names.map(n => n.trim()).filter(Boolean);
  const allUnique = new Set(trimmed).size === trimmed.length;
  const canPlay = trimmed.length >= 2 && allUnique;

  const updateName = (index: number, value: string) => {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => {
    if (names.length < 3) setNames(prev => [...prev, ""]);
  };

  const removePlayer = (index: number) => {
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (!canPlay) return;
    playClick();
    dispatch({ type: "CREATE_ROOM", playerName: trimmed[0] });
    for (let i = 1; i < trimmed.length; i++) {
      dispatch({ type: "JOIN_ROOM", playerName: trimmed[i] });
    }
    dispatch({ type: "START_GAME" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-card/80 border border-border text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
      >
        {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {/* Full-screen hero background */}
      <motion.img
        src={heroWomen}
        alt=""
        initial={{ opacity: 0, scale: 1.15, y: 30 }}
        animate={{ opacity: 0.22, scale: 1, y: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ transformOrigin: "center bottom" }}
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
          <span className="font-body font-semibold text-foreground text-xs sm:text-sm">2–3 players or teams</span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="text-muted-foreground font-body text-xs sm:text-sm">1 device · 1 round each · One draws, others guess</span>
        </div>

        <div className="space-y-3">
          {names.map((name, i) => (
            <div key={i}>
              <label htmlFor={`player${i + 1}-name`} className="block text-xs font-body font-semibold text-foreground/60 uppercase tracking-wider mb-1">
                Player / Team {i + 1}
              </label>
              <div className="flex gap-2">
                <input
                  id={`player${i + 1}-name`}
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  maxLength={16}
                  className="flex-1 px-5 py-3 border border-input bg-card text-foreground font-body text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.02] transition-transform shadow-card"
                />
                {i >= 2 && (
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => removePlayer(i)}
                    aria-label={`Remove player ${i + 1}`}
                    className="w-12 border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>
            </div>
          ))}

          <AnimatePresence>
            {names.length < 3 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={addPlayer}
                  className="w-full py-2.5 border border-dashed border-input bg-card/50 text-muted-foreground font-body text-sm hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  Add Player / Team
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={canPlay ? buttonGlowHover : {}}
            whileTap={canPlay ? buttonTap : {}}
            onClick={handleStart}
            disabled={!canPlay}
            className="w-full gradient-primary text-primary-foreground font-body font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
          >
            <Play size={20} />
            Play
          </motion.button>
        </div>
      </motion.div>

      <footer className="relative z-10 mt-8 text-center space-y-1">
        <p className="text-xs text-muted-foreground/60 font-body">
          Built by <a href="https://www.neversay.no/" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">Piia</a> with{" "}
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">Lovable</a>
          {" "}&{" "}
          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">Claude</a>
          {" · "}
          <a href="https://github.com/alavesa/draw-her-story" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">Source</a>
        </p>
        <p className="text-xs text-muted-foreground/60 font-body">
          Made for the{" "}
          <a href="https://shebuilds.lovable.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground transition-colors">She Builds</a>
          {" "}hackathon
        </p>
      </footer>
    </div>
  );
}
