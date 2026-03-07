import { useRef, useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import DrawingCanvas from "./DrawingCanvas";
import ChatPanel from "./ChatPanel";
import GameTimer from "./GameTimer";
import WordHint from "./WordHint";
import ConfettiCelebration from "./ConfettiCelebration";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Palette, Sparkles } from "lucide-react";
import { subPhaseVariants, buttonTap, buttonGlowHover } from "@/lib/animations";
import { playCorrectGuess, playRoundStart } from "@/lib/sounds";

export default function GameScreen() {
  const { state, dispatch, isMultiplayer, isArtist } = useGameState();
  const canvasRef = useRef(null);
  const artist = state.players[state.currentArtistIndex];
  const guessers = state.players.filter((_, i) => i !== state.currentArtistIndex);

  // Confetti trigger on correct guess
  const [confettiKey, setConfettiKey] = useState(0);
  const prevMessageCount = useRef(state.messages.length);

  // Sound on round start
  useEffect(() => {
    if (state.drawingSubPhase === "active") {
      playRoundStart();
    }
  }, [state.drawingSubPhase]);

  useEffect(() => {
    if (state.messages.length > prevMessageCount.current) {
      const newMessages = state.messages.slice(prevMessageCount.current);
      if (newMessages.some(m => m.type === "correct")) {
        setConfettiKey(k => k + 1);
        playCorrectGuess();
      }
    }
    prevMessageCount.current = state.messages.length;
  }, [state.messages]);

  // In multiplayer, skip pass-to-artist; artist sees word, guessers wait
  const showPassToArtist = !isMultiplayer && state.drawingSubPhase === "pass-to-artist";
  const showShowingWord = isMultiplayer
    ? state.drawingSubPhase === "showing-word" && isArtist
    : state.drawingSubPhase === "showing-word";
  const showWaitingForArtist = isMultiplayer && state.drawingSubPhase === "showing-word" && !isArtist;
  const showActive = state.drawingSubPhase === "active";

  return (
    <>
      <ConfettiCelebration trigger={confettiKey > 0} key={confettiKey} />
      <AnimatePresence mode="wait">
        {/* Step 1: Pass device to artist (local mode only) */}
        {showPassToArtist && (
          <motion.div
            key="pass-to-artist"
            variants={subPhaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center p-4 bg-background"
          >
            <div className="w-full max-w-md text-center" role="status" aria-live="polite">
              <h1 className="sr-only">Pass the device to {artist?.name}</h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-display font-bold text-2xl"
                style={{ backgroundColor: artist?.color + "22", color: artist?.color }}
                aria-hidden="true"
              >
                {artist?.name[0].toUpperCase()}
              </motion.div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Pass the device to
              </h2>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-primary mb-4">
                {artist?.name}
              </p>
              <p className="text-muted-foreground font-body mb-2">
                It's your turn to draw!
              </p>
              <p className="text-sm text-muted-foreground font-body mb-8">
                Make sure {guessers.map(g => g.name).join(" and ")} {guessers.length === 1 ? "isn't" : "aren't"} looking at the screen.
              </p>
              <motion.button
                whileHover={buttonGlowHover}
                whileTap={buttonTap}
                onClick={() => dispatch({ type: "ARTIST_PEEK" })}
                className="w-full gradient-primary text-primary-foreground font-body font-bold py-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Sparkles size={20} aria-hidden="true" />
                I'm {artist?.name} — Show my word
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Show word to artist */}
        {showShowingWord && (
          <motion.div
            key="showing-word"
            variants={subPhaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center p-4 bg-background"
          >
            <div className="w-full max-w-md text-center" role="status" aria-live="polite">
              <h1 className="sr-only">Your word to draw: {state.currentWord?.word}</h1>
              <div className="bg-card border border-border p-5 sm:p-8 shadow-elevated mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Palette size={18} className="text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground font-body uppercase tracking-wider">Your word to draw</span>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-2xl sm:text-4xl font-bold text-primary mb-4"
                >
                  {state.currentWord?.word}
                </motion.p>
                <p className="text-sm text-muted-foreground font-body">
                  Memorize this word — it will be hidden once you start drawing.
                </p>
              </div>
              <motion.button
                whileHover={buttonGlowHover}
                whileTap={buttonTap}
                onClick={() => dispatch({ type: "START_DRAWING" })}
                className="w-full gradient-primary text-primary-foreground font-body font-bold py-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Got it — Start drawing!
              </motion.button>
              <p className="text-xs text-muted-foreground font-body mt-4">
                The timer will start when you press the button above.
              </p>
            </div>
          </motion.div>
        )}

        {/* Multiplayer: Waiting for artist to start */}
        {showWaitingForArtist && (
          <motion.div
            key="waiting-for-artist"
            variants={subPhaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center p-4 bg-background"
          >
            <div className="w-full max-w-md text-center" role="status" aria-live="polite">
              <h1 className="sr-only">Waiting for {artist?.name} to start drawing</h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-display font-bold text-2xl"
                style={{ backgroundColor: artist?.color + "22", color: artist?.color }}
                aria-hidden="true"
              >
                {artist?.name[0].toUpperCase()}
              </motion.div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {artist?.name} is getting ready to draw
              </h2>
              <p className="text-muted-foreground font-body mt-4">
                The round will start soon...
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Active drawing phase */}
        {showActive && (
          <motion.div
            key="active"
            variants={subPhaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-background"
            aria-label="Game screen"
          >
            <h1 className="sr-only">Drawing round {state.roundIndex + 1} — {artist?.name} is drawing</h1>
            {/* Header */}
            <div className="border-b border-border bg-card/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs" style={{ backgroundColor: artist?.color + "22", color: artist?.color }}>
                    {artist?.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-body font-semibold text-foreground text-sm">{artist?.name}</span>
                    <span className="text-xs text-muted-foreground font-body ml-2">is drawing</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-body text-muted-foreground">
                    Round {state.roundIndex + 1}/{state.players.length}
                  </span>
                  <div className="hidden sm:flex gap-2">
                    {state.players.map(p => (
                      <div key={p.id} className="flex items-center gap-1 px-2 py-1 bg-secondary text-xs font-body">
                        <span className="font-medium text-foreground">{p.name.slice(0, 6)}</span>
                        <motion.span
                          key={`${p.id}-${p.score}`}
                          initial={{ scale: 1.4 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-accent font-bold"
                        >
                          {p.score}
                        </motion.span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto p-2 sm:p-4">
              <div className="mb-3 sm:mb-4">
                <GameTimer />
              </div>

              <div className="mb-3 sm:mb-4 bg-card border border-border p-2 sm:p-3 shadow-card">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <Eye size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs text-muted-foreground font-body">Hint</span>
                </div>
                <WordHint />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="lg:col-span-2">
                  <DrawingCanvas ref={canvasRef} disabled={isMultiplayer && !isArtist} />
                </div>
                <div className="lg:col-span-1">
                  <ChatPanel />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
