import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Copy, Play, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const [newName, setNewName] = useState("");

  const addPlayer = () => {
    if (!newName.trim() || state.players.length >= 4) return;
    dispatch({ type: "JOIN_ROOM", playerName: newName.trim() });
    setNewName("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(state.roomCode);
    toast.success("Room code copied!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Game Lobby</h2>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-body font-bold text-lg hover:bg-secondary/80 transition-colors"
          >
            Room: {state.roomCode}
            <Copy size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">Players ({state.players.length}/4)</h3>
          </div>
          <div className="space-y-3 mb-4">
            {state.players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm"
                  style={{ backgroundColor: p.color + "22", color: p.color }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <span className="font-body font-medium text-foreground flex-1">{p.name}</span>
                {i === 0 && (
                  <span className="text-xs font-body px-2 py-0.5 rounded-full gradient-gold text-accent-foreground">Host</span>
                )}
              </motion.div>
            ))}
          </div>

          {state.players.length < 4 && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add player name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPlayer()}
                maxLength={16}
                className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={addPlayer}
                disabled={!newName.trim()}
                className="w-10 h-10 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <UserPlus size={18} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => dispatch({ type: "START_GAME" })}
          disabled={state.players.length < 2}
          className="w-full gradient-primary text-primary-foreground font-body font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
        >
          <Play size={22} />
          Start Game
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3 font-body">
          Need at least 2 players to start
        </p>
      </motion.div>
    </div>
  );
}
