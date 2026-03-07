import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/context/GameContext";
import { useGameState } from "@/hooks/useGameState";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Check } from "lucide-react";
import { chatMessageVariants, buttonTap } from "@/lib/animations";
import { playCloseGuess, playClick } from "@/lib/sounds";

export default function ChatPanel() {
  const { state, dispatch, isMultiplayer, isArtist, myPlayerId } = useGameState();
  const [input, setInput] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(state.messages.length);
  const guessers = state.players.filter((_, i) => i !== state.currentArtistIndex);
  const [activeGuesserId, setActiveGuesserId] = useState(guessers[0]?.id ?? "");

  // Keep activeGuesserId in sync when round changes
  useEffect(() => {
    if (guessers.length > 0 && !guessers.find(g => g.id === activeGuesserId)) {
      setActiveGuesserId(guessers[0].id);
    }
  }, [state.currentArtistIndex]);

  // Scroll + close guess sound
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
    if (state.messages.length > prevMsgCount.current) {
      const newMsgs = state.messages.slice(prevMsgCount.current);
      if (newMsgs.some(m => m.type === "close")) {
        playCloseGuess();
        setLastFeedback("Close guess! Try again.");
      } else if (newMsgs.some(m => m.type === "correct")) {
        setLastFeedback("Correct!");
      } else if (newMsgs.some(m => m.type === "wrong")) {
        setLastFeedback("Wrong guess. Keep trying!");
      }
    }
    prevMsgCount.current = state.messages.length;
  }, [state.messages]);

  const activeGuesser = guessers.find(g => g.id === activeGuesserId) || guessers[0];

  // In multiplayer, the current player submits guesses as themselves
  // In local mode, the selected guesser tab determines who's guessing
  const canSubmitGuess = isMultiplayer ? !isArtist : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canSubmitGuess) return;
    playClick();

    if (isMultiplayer) {
      // In multiplayer, submit-guess goes to server with just the text
      dispatch({ type: "SUBMIT_GUESS", playerId: myPlayerId ?? "", text: input.trim() });
    } else {
      // In local mode, submit as the selected guesser
      if (!activeGuesser) return;
      dispatch({ type: "SUBMIT_GUESS", playerId: activeGuesser.id, text: input.trim() });
    }
    setInput("");
  };

  // Show guesser tabs only in local mode with multiple guessers
  const showGuesserTabs = !isMultiplayer && guessers.length > 1;

  return (
    <div className="flex flex-col h-full border border-border bg-card shadow-card overflow-hidden">
      <div className="px-3 py-2 sm:px-4 sm:py-3 gradient-primary">
        <h2 className="font-display font-semibold text-primary-foreground text-sm">Guesses</h2>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{lastFeedback}</div>
      <div ref={scrollRef} role="log" aria-live="polite" aria-label="Game guesses" className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 min-h-0" style={{ maxHeight: "clamp(150px, 30vh, 300px)" }}>
        <AnimatePresence initial={false}>
          {state.messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={chatMessageVariants}
              initial="initial"
              animate="animate"
            >
              <MessageBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {state.phase === "drawing" && canSubmitGuess && (
        <div className="border-t border-border">
          {showGuesserTabs && (
            <div className="flex" role="tablist" aria-label="Select guesser">
              {guessers.map(g => {
                const isActive = g.id === activeGuesser?.id;
                const hasGuessed = g.hasGuessedCorrectly;
                return (
                  <button
                    key={g.id}
                    role="tab"
                    aria-selected={isActive}
                    disabled={hasGuessed}
                    onClick={() => setActiveGuesserId(g.id)}
                    className={`flex-1 py-1.5 text-xs font-body font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      hasGuessed
                        ? "text-muted-foreground/50 line-through cursor-not-allowed"
                        : isActive
                          ? "bg-primary/10 text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-disabled={hasGuessed}
                    style={isActive && !hasGuessed ? { color: g.color } : undefined}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
          <form onSubmit={handleSubmit} aria-label="Submit a guess" className="p-2 sm:p-3 flex gap-2">
          <label htmlFor="guess-input" className="sr-only">Type your guess</label>
          <input
            id="guess-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your guess..."
            className="flex-1 px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <motion.button
            whileTap={buttonTap}
            type="submit"
            aria-label="Send guess"
            className="w-9 h-9 gradient-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Send size={16} aria-hidden="true" />
          </motion.button>
          </form>
        </div>
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
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30"
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
          <Check size={14} className="text-accent shrink-0" />
        </motion.div>
        <span className="text-sm font-medium text-foreground">{message.playerName} guessed correctly!</span>
      </motion.div>
    );
  }
  if (message.type === "close") {
    return (
      <motion.div
        animate={{ x: [0, -4, 4, -4, 4, 0] }}
        transition={{ duration: 0.4 }}
        className="px-3 py-2 bg-destructive/10 border border-destructive/20"
      >
        <span className="text-sm text-foreground"><strong>{message.playerName}:</strong> {message.text}</span>
      </motion.div>
    );
  }
  return (
    <div className="px-3 py-2 bg-secondary">
      <span className="text-sm"><strong className="text-primary">{message.playerName}:</strong> {message.text}</span>
    </div>
  );
}
