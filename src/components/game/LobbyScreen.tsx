import { useMultiplayer } from "@/context/MultiplayerContext";
import { motion } from "framer-motion";
import { Copy, Play, Users, Wifi, ArrowLeft } from "lucide-react";
import { buttonTap, buttonGlowHover, buttonHover } from "@/lib/animations";
import { playClick } from "@/lib/sounds";
import { toast } from "sonner";

export default function LobbyScreen() {
  const mp = useMultiplayer();
  const players = mp.remoteState?.players ?? [];
  const isHost = mp.isHost;
  const canStart = isHost && players.length >= 2;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mp.roomCode);
      toast.success("Room code copied!");
    } catch {
      toast.error("Could not copy code");
    }
  };

  const handleStart = () => {
    playClick();
    mp.sendMessage({ type: "start-game" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 gradient-primary blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 gradient-pink blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <button
          onClick={() => mp.leaveRoom()}
          className="text-sm text-muted-foreground hover:text-foreground font-body flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={14} /> Leave Room
        </button>

        {/* Room code card */}
        <div className="bg-card border border-border p-6 shadow-elevated text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wifi size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Room Code</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-4xl font-extrabold text-foreground tracking-[0.3em]">
              {mp.roomCode}
            </span>
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={handleCopyCode}
              aria-label="Copy room code"
              className="w-10 h-10 border border-border bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Copy size={16} />
            </motion.button>
          </div>
          <p className="text-sm text-muted-foreground font-body mt-3">
            Share this code with friends to join
          </p>
        </div>

        {/* Players list */}
        <div className="bg-card border border-border p-4 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-primary" />
            <span className="font-body font-semibold text-foreground text-sm">
              Players ({players.length}/4)
            </span>
          </div>
          <div className="space-y-2">
            {players.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 px-3 py-2 bg-secondary"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs"
                  style={{ backgroundColor: player.color + "22", color: player.color }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="font-body font-medium text-foreground flex-1">{player.name}</span>
                {player.id === mp.remoteState?.hostId && (
                  <span className="text-xs font-body text-primary font-semibold">HOST</span>
                )}
                {player.id === mp.playerId && (
                  <span className="text-xs font-body text-muted-foreground">(you)</span>
                )}
              </motion.div>
            ))}
          </div>
          {players.length < 2 && (
            <p className="text-xs text-muted-foreground font-body mt-3 text-center">
              Waiting for at least 1 more player...
            </p>
          )}
        </div>

        {/* Start button (host only) */}
        {isHost ? (
          <motion.button
            whileHover={canStart ? buttonGlowHover : {}}
            whileTap={canStart ? buttonTap : {}}
            onClick={handleStart}
            disabled={!canStart}
            className="w-full gradient-primary text-primary-foreground font-body font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-elevated text-lg"
          >
            <Play size={20} />
            Start Game
          </motion.button>
        ) : (
          <div className="text-center py-3.5 bg-card border border-border text-muted-foreground font-body font-medium">
            Waiting for host to start...
          </div>
        )}

        {mp.error && (
          <p className="text-sm text-destructive font-body mt-3 text-center">{mp.error}</p>
        )}
      </motion.div>
    </div>
  );
}
