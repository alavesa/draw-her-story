import { useRef } from "react";
import { useGame } from "@/context/GameContext";
import DrawingCanvas from "./DrawingCanvas";
import ChatPanel from "./ChatPanel";
import GameTimer from "./GameTimer";
import WordHint from "./WordHint";
import { Eye, Palette } from "lucide-react";

export default function GameScreen() {
  const { state } = useGame();
  const canvasRef = useRef(null);
  const artist = state.players[state.currentArtistIndex];
  const isArtist = true; // In local play, when drawing phase shows, the current viewer IS the artist

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
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
                <div key={p.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs font-body">
                  <span className="font-medium text-foreground">{p.name.slice(0, 6)}</span>
                  <span className="text-accent font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Timer */}
        <div className="mb-4">
          <GameTimer />
        </div>

        {/* Word display for artist / hints for guessers */}
        <div className="mb-4 text-center">
          {/* Show word to artist, show hints panel below for guessers */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Palette size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Your word to draw</span>
            </div>
            <p className="font-display text-2xl font-bold text-primary">{state.currentWord?.word}</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">
              Pass the device to guessers when you're done looking!
            </p>
          </div>
        </div>

        {/* Hint bar */}
        <div className="mb-4 bg-card border border-border rounded-xl p-3 shadow-card">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <Eye size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-body">Hint for guessers</span>
          </div>
          <WordHint />
        </div>

        {/* Canvas + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
