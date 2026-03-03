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
    <div className="flex items-center gap-3" role="timer" aria-label={`${state.timeRemaining} seconds remaining`}>
      <Clock size={18} className={isLow ? "text-destructive animate-pulse" : "text-muted-foreground"} aria-hidden="true" />
      <div className="flex-1 h-3 bg-secondary overflow-hidden" role="progressbar" aria-valuenow={state.timeRemaining} aria-valuemin={0} aria-valuemax={90} aria-label="Time remaining">
        <div
          className={`h-full transition-all duration-1000 ${isLow ? "bg-destructive" : "gradient-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-body font-bold text-lg tabular-nums min-w-[2.5rem] text-right ${isLow ? "text-destructive" : "text-foreground"}`} aria-hidden="true">
        {state.timeRemaining}s
      </span>
    </div>
  );
}
