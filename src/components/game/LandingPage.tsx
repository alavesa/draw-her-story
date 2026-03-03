import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Palette, Users, Sparkles } from "lucide-react";
import heroWomen from "@/assets/hero-women.png";

export default function LandingPage() {
  const { dispatch } = useGame();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"none" | "create" | "join">("none");

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch({ type: "CREATE_ROOM", playerName: name.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 gradient-primary blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 gradient-gold blur-3xl" />

      {/* Hero Women Image */}
      <motion.img
        src={heroWomen}
        alt="Diverse women celebrating together with paintbrushes"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg mb-[-2rem]"
      />

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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gradient-primary text-primary-foreground text-xs font-body font-semibold tracking-wider uppercase mb-6"
        >
          <Sparkles size={14} />
          International Women's Day
        </motion.div>

        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-foreground mb-3 leading-tight">
          Draw Her <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Story</span>
        </h1>
        <p className="font-body text-muted-foreground text-lg mb-8">
          Sketch, Guess, and Celebrate the Women Who Changed the World
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your display name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            className="w-full px-5 py-3.5 rounded-xl border border-input bg-card text-foreground font-body text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring shadow-card"
          />

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex-1 gradient-primary text-primary-foreground font-body font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated"
            >
              <Palette size={20} />
              Create Room
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex-1 gradient-gold text-accent-foreground font-body font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-card"
            >
              <Users size={20} />
              Join Room
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-body mt-6">2-4 players · Same device · Pass & play</p>
      </motion.div>
    </div>
  );
}
