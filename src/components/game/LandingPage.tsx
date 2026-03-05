import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useMultiplayer } from "@/context/MultiplayerContext";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Sparkles, UserPlus, X, Volume2, VolumeX, Wifi, Monitor, ArrowLeft } from "lucide-react";
import heroWomen from "@/assets/hero-women.png";
import { buttonTap, buttonGlowHover, buttonHover } from "@/lib/animations";
import { isSoundEnabled, setSoundEnabled, playClick } from "@/lib/sounds";

export default function LandingPage() {
  const { dispatch } = useGame();
  const mp = useMultiplayer();
  const [names, setNames] = useState(["", ""]);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [mode, setMode] = useState<"choose" | "local" | "multi-create" | "multi-join">("choose");
  const [multiName, setMultiName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // ── Local mode logic ───────────────────────────────────────────
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

  const handleLocalStart = () => {
    if (!canPlay) return;
    playClick();
    dispatch({ type: "CREATE_ROOM", playerName: trimmed[0] });
    for (let i = 1; i < trimmed.length; i++) {
      dispatch({ type: "JOIN_ROOM", playerName: trimmed[i] });
    }
    dispatch({ type: "START_GAME" });
  };

  // ── Multiplayer logic ──────────────────────────────────────────
  const canMulti = multiName.trim().length > 0;

  const handleCreateRoom = () => {
    if (!canMulti) return;
    playClick();
    mp.createRoom(multiName.trim());
  };

  const handleJoinRoom = () => {
    if (!canMulti || joinCode.trim().length < 4) return;
    playClick();
    mp.joinRoom(joinCode.trim(), multiName.trim());
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

        {/* ── Mode chooser ─────────────────────────────────────── */}
        {mode === "choose" && (
          <div className="space-y-3 mt-6">
            <motion.button
              whileHover={buttonGlowHover}
              whileTap={buttonTap}
              onClick={() => setMode("local")}
              className="w-full py-3.5 gradient-primary text-primary-foreground font-body font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated text-lg"
            >
              <Monitor size={20} />
              Same Device
            </motion.button>
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={() => setMode("multi-create")}
              className="w-full py-3.5 border border-border bg-card text-foreground font-body font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <Wifi size={20} />
              Multi-Device
            </motion.button>
          </div>
        )}

        {/* ── Local mode ───────────────────────────────────────── */}
        {mode === "local" && (
          <div className="space-y-3 mt-4">
            <button onClick={() => setMode("choose")} className="text-sm text-muted-foreground hover:text-foreground font-body flex items-center gap-1 mx-auto mb-2">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-card/80 border border-border backdrop-blur-sm mb-2">
              <span className="font-body font-semibold text-foreground text-xs sm:text-sm">2–3 players or teams</span>
              <span className="text-border hidden sm:inline">|</span>
              <span className="text-muted-foreground font-body text-xs sm:text-sm">1 device · 1 round each</span>
            </div>

            {names.map((name, i) => (
              <div key={i}>
                <label htmlFor={`player${i + 1}-name`} className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
              onClick={handleLocalStart}
              disabled={!canPlay}
              className="w-full gradient-primary text-primary-foreground font-body font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
            >
              <Play size={20} />
              Play
            </motion.button>
          </div>
        )}

        {/* ── Multi-device: Create room ────────────────────────── */}
        {mode === "multi-create" && (
          <div className="space-y-3 mt-4">
            <button onClick={() => setMode("choose")} className="text-sm text-muted-foreground hover:text-foreground font-body flex items-center gap-1 mx-auto mb-2">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-card/80 border border-border backdrop-blur-sm mb-2">
              <Wifi size={14} className="text-primary" />
              <span className="text-muted-foreground font-body text-xs sm:text-sm">Each player on their own device</span>
            </div>

            <div>
              <label htmlFor="multi-name" className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Your name
              </label>
              <input
                id="multi-name"
                type="text"
                placeholder="Enter your name"
                value={multiName}
                onChange={e => setMultiName(e.target.value)}
                maxLength={16}
                className="w-full px-5 py-3 border border-input bg-card text-foreground font-body text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.02] transition-transform shadow-card"
              />
            </div>

            <motion.button
              whileHover={canMulti ? buttonGlowHover : {}}
              whileTap={canMulti ? buttonTap : {}}
              onClick={handleCreateRoom}
              disabled={!canMulti}
              className="w-full gradient-primary text-primary-foreground font-body font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
            >
              <Sparkles size={20} />
              Create Room
            </motion.button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-body">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <label htmlFor="join-code" className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Join with room code
              </label>
              <input
                id="join-code"
                type="text"
                placeholder="Enter room code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-5 py-3 border border-input bg-card text-foreground font-body text-center text-lg uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.02] transition-transform shadow-card"
              />
            </div>

            <motion.button
              whileHover={canMulti && joinCode.trim().length >= 4 ? buttonHover : {}}
              whileTap={canMulti && joinCode.trim().length >= 4 ? buttonTap : {}}
              onClick={handleJoinRoom}
              disabled={!canMulti || joinCode.trim().length < 4}
              className="w-full border border-border bg-card text-foreground font-body font-bold py-3.5 hover:bg-secondary transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-lg"
            >
              Join Room
            </motion.button>

            {mp.error && (
              <p className="text-sm text-destructive font-body">{mp.error}</p>
            )}
          </div>
        )}
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
