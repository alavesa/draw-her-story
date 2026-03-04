import { GameProvider, useGame } from "@/context/GameContext";
import { AnimatePresence, motion } from "framer-motion";
import { phaseVariants } from "@/lib/animations";
import LandingPage from "@/components/game/LandingPage";
import GameScreen from "@/components/game/GameScreen";
import RevealCard from "@/components/game/RevealCard";
import ResultsScreen from "@/components/game/ResultsScreen";

function GameRouter() {
  const { state } = useGame();

  const Component = (() => {
    switch (state.phase) {
      case "landing": return <LandingPage />;
      case "drawing": return <GameScreen />;
      case "reveal": return <RevealCard />;
      case "results": return <ResultsScreen />;
      default: return <LandingPage />;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.phase}
        variants={phaseVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
      >
        {Component}
      </motion.div>
    </AnimatePresence>
  );
}

const Index = () => {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
};

export default Index;
