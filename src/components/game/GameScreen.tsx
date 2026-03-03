import { useRef } from "react";
import { useGame } from "@/context/GameContext";
import DrawingCanvas from "./DrawingCanvas";
import ChatPanel from "./ChatPanel";
import GameTimer from "./GameTimer";
import WordHint from "./WordHint";
import { motion } from "framer-motion";
import { Eye, Palette, Sparkles } from "lucide-react";

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const canvasRef = useRef(null);
  const artist = state.players[state.currentArtistIndex];
  const guessers = state.players.filter((_, i) => i !== state.currentArtistIndex);

  // Step 1: Pass device to artist screen
  if (state.drawingSubPhase === "pass-to-artist") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-display font-bold text-2xl"
            style={{ backgroundColor: artist?.color + "22", color: artist?.color }}
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
          <button
            onClick={() => dispatch({ type: "ARTIST_PEEK" })}
            className="w-full gradient-primary text-primary-foreground font-body font-bold py-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated text-lg"
          >
            <Sparkles size={20} aria-hidden="true" />
            I'm {artist?.name} — Show my word
          </button>
        </motion.div>
      </div>
    );
  }

  // Step 2: Show word to artist privately
  if (state.drawingSubPhase === "showing-word") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
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
          <button
            onClick={() => dispatch({ type: "START_DRAWING" })}
            className="w-full gradient-primary text-primary-foreground font-body font-bold py-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated text-lg"
          >
            Got it — Start drawing!
          </button>
          <p className="text-xs text-muted-foreground font-body mt-4">
            The timer will start when you press the button above.
          </p>
        </motion.div>
      </div>
    );
  }

  // Step 3: Active drawing phase — word is hidden
  return (
    <div className="min-h-screen bg-background" role="main" aria-label="Game screen">
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
            {/* Scores */}
            <div className="hidden sm:flex gap-2">
              {state.players.map(p => (
                <div key={p.id} className="flex items-center gap-1 px-2 py-1 bg-secondary text-xs font-body">
                  <span className="font-medium text-foreground">{p.name.slice(0, 6)}</span>
                  <span className="text-accent font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        {/* Timer */}
        <div className="mb-3 sm:mb-4">
          <GameTimer />
        </div>

        {/* Hint bar */}
        <div className="mb-3 sm:mb-4 bg-card border border-border p-2 sm:p-3 shadow-card">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <Eye size={14} className="text-muted-foreground" aria-hidden="true" />
            <span className="text-xs text-muted-foreground font-body">Hint</span>
          </div>
          <WordHint />
        </div>

        {/* Canvas + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <DrawingCanvas ref={canvasRef} />
          </div>
          <div className="lg:col-span-1">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
