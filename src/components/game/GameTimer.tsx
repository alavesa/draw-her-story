import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Clock } from "lucide-react";

export default function GameTimer() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase !== "drawing") return;
    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase, dispatch]);

  const pct = (state.timeRemaining / 90) * 100;
  const isLow = state.timeRemaining <= 15;

  return (
    <div className="flex items-center gap-3">
      <Clock size={18} className={isLow ? "text-destructive animate-pulse" : "text-muted-foreground"} />
      <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isLow ? "bg-destructive" : "gradient-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-body font-bold text-lg tabular-nums min-w-[2.5rem] text-right ${isLow ? "text-destructive" : "text-foreground"}`}>
        {state.timeRemaining}s
      </span>
    </div>
  );
}
