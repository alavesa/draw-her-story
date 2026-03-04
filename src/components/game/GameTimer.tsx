import { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { playTick, playTimerExpired } from "@/lib/sounds";

export default function GameTimer() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase !== "drawing") return;
    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase, dispatch]);

  const prevTime = useRef(state.timeRemaining);

  useEffect(() => {
    if (state.timeRemaining < prevTime.current) {
      if (state.timeRemaining > 0 && state.timeRemaining <= 15) {
        playTick();
      }
      if (state.timeRemaining === 0 && prevTime.current > 0) {
        playTimerExpired();
      }
    }
    prevTime.current = state.timeRemaining;
  }, [state.timeRemaining]);

  const pct = (state.timeRemaining / 90) * 100;
  const isWarning = state.timeRemaining <= 30 && state.timeRemaining > 15;
  const isCritical = state.timeRemaining <= 15;

  return (
    <div className="flex items-center gap-3" role="timer" aria-label={`${state.timeRemaining} seconds remaining`}>
      <motion.div
        animate={isCritical ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={isCritical ? { repeat: Infinity, duration: 0.5, repeatDelay: 0.5 } : {}}
      >
        <Clock
          size={18}
          className={isCritical ? "text-destructive" : isWarning ? "text-orange-500" : "text-muted-foreground"}
          aria-hidden="true"
        />
      </motion.div>
      <div className="flex-1 h-3 bg-secondary overflow-hidden" role="progressbar" aria-valuenow={state.timeRemaining} aria-valuemin={0} aria-valuemax={90} aria-label="Time remaining">
        <motion.div
          className={`h-full transition-all duration-1000 ${isCritical ? "bg-destructive" : isWarning ? "bg-orange-400" : "gradient-primary"}`}
          animate={isCritical ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
          transition={isCritical ? { repeat: Infinity, duration: 0.8 } : {}}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="min-w-[2.5rem] text-right overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={state.timeRemaining}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`font-body font-bold text-lg tabular-nums block ${
              isCritical ? "text-destructive" : isWarning ? "text-orange-500" : "text-foreground"
            }`}
            aria-hidden="true"
          >
            {state.timeRemaining}s
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
