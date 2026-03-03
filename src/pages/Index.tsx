import { GameProvider, useGame } from "@/context/GameContext";
import LandingPage from "@/components/game/LandingPage";
import LobbyScreen from "@/components/game/LobbyScreen";
import GameScreen from "@/components/game/GameScreen";
import RevealCard from "@/components/game/RevealCard";
import ResultsScreen from "@/components/game/ResultsScreen";

function GameRouter() {
  const { state } = useGame();

  switch (state.phase) {
    case "landing": return <LandingPage />;
    case "lobby": return <LobbyScreen />;
    case "drawing": return <GameScreen />;
    case "reveal": return <RevealCard />;
    case "results": return <ResultsScreen />;
    default: return <LandingPage />;
  }
}

const Index = () => {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
};

export default Index;
