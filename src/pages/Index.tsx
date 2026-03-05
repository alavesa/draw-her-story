import { GameProvider, useGame } from "@/context/GameContext";
import { MultiplayerProvider, useMultiplayer } from "@/context/MultiplayerContext";
import { AnimatePresence, motion } from "framer-motion";
import { phaseVariants } from "@/lib/animations";
import LandingPage from "@/components/game/LandingPage";
import LobbyScreen from "@/components/game/LobbyScreen";
import GameScreen from "@/components/game/GameScreen";
import RevealCard from "@/components/game/RevealCard";
import ResultsScreen from "@/components/game/ResultsScreen";

function GameRouter() {
  const { state: localState } = useGame();
  const mp = useMultiplayer();

  // Determine which phase to show
  const phase = mp.isMultiplayer
    ? (mp.remoteState?.phase ?? "landing")
    : localState.phase;

  const Component = (() => {
    if (mp.isMultiplayer && !mp.remoteState) return <LandingPage />;
    switch (phase) {
      case "landing": return <LandingPage />;
      case "lobby": return <LobbyScreen />;
      case "drawing": return <GameScreen />;
      case "reveal": return <RevealCard />;
      case "results": return <ResultsScreen />;
      default: return <LandingPage />;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
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
    <MultiplayerProvider>
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </MultiplayerProvider>
  );
};

export default Index;
