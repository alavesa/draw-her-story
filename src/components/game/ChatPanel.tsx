import { useState, useRef, useEffect } from "react";
import { useGame, ChatMessage } from "@/context/GameContext";
import { Send, Check } from "lucide-react";

export default function ChatPanel() {
  const { state, dispatch } = useGame();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentPlayerId = state.players[state.currentArtistIndex]?.id === "p1" ? "p2" : "p1"; // For local play, guesser is always non-artist

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // In local multiplayer, we cycle through non-artist players
    const nonArtists = state.players.filter((_, i) => i !== state.currentArtistIndex);
    // For simplicity in local mode, use the first non-artist who hasn't guessed
    const guesser = nonArtists.find(p => !p.hasGuessedCorrectly) || nonArtists[0];
    if (guesser) {
      dispatch({ type: "SUBMIT_GUESS", playerId: guesser.id, text: input.trim() });
    }
    setInput("");
  };

  const isArtist = false; // In local play, the guess panel is always for guessers

  return (
    <div className="flex flex-col h-full border border-border bg-card shadow-card overflow-hidden">
      <div className="px-3 py-2 sm:px-4 sm:py-3 gradient-primary">
        <h3 className="font-display font-semibold text-primary-foreground text-sm">Guesses</h3>
      </div>
      <div ref={scrollRef} role="log" aria-live="polite" aria-label="Game guesses" className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 min-h-0" style={{ maxHeight: "clamp(150px, 30vh, 300px)" }}>
        {state.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      {state.phase === "drawing" && (
        <form onSubmit={handleSubmit} aria-label="Submit a guess" className="p-2 sm:p-3 border-t border-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Type your guess"
            placeholder="Type your guess..."
            className="flex-1 px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" aria-label="Send guess" className="w-9 h-9 gradient-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.type === "system") {
    return <div className="text-center text-xs text-muted-foreground py-1">{message.text}</div>;
  }
  if (message.type === "correct") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30">
        <Check size={14} className="text-accent shrink-0" />
        <span className="text-sm font-medium text-foreground">{message.playerName} guessed correctly!</span>
      </div>
    );
  }
  if (message.type === "close") {
    return (
      <div className="px-3 py-2 bg-destructive/10 border border-destructive/20">
        <span className="text-sm text-foreground"><strong>{message.playerName}:</strong> {message.text}</span>
      </div>
    );
  }
  return (
    <div className="px-3 py-2 bg-secondary">
      <span className="text-sm"><strong className="text-primary">{message.playerName}:</strong> {message.text}</span>
    </div>
  );
}
