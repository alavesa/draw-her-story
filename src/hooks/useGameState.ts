import { useGame, type GameState } from "@/context/GameContext";
import { useMultiplayer } from "@/context/MultiplayerContext";
import { useCallback } from "react";

/**
 * Unified game state hook. In local mode, uses the local reducer.
 * In multiplayer mode, derives state from the server and sends
 * actions over WebSocket.
 */
export function useGameState() {
  const { state: localState, dispatch: localDispatch } = useGame();
  const mp = useMultiplayer();

  const state: GameState = mp.isMultiplayer && mp.remoteState
    ? {
        phase: mp.remoteState.phase === "lobby" ? "lobby" : mp.remoteState.phase,
        drawingSubPhase: mp.remoteState.drawingSubPhase,
        players: mp.remoteState.players,
        currentPlayerIndex: 0,
        currentArtistIndex: mp.remoteState.currentArtistIndex,
        roundIndex: mp.remoteState.roundIndex,
        // In multiplayer, currentWord comes from server (only during reveal/results)
        // or from artistWord (if we're the artist during drawing)
        currentWord: mp.remoteState.currentWord ?? mp.artistWord ?? null,
        usedWords: [],
        guessedWords: mp.remoteState.guessedWords,
        messages: mp.remoteState.messages,
        timeRemaining: mp.remoteState.timeRemaining,
        revealedHints: mp.remoteState.revealedHints,
        roomCode: mp.roomCode,
        hostId: mp.remoteState.hostId,
      }
    : localState;

  // In multiplayer, the wordHint comes from the server
  const wordHint = mp.isMultiplayer && mp.remoteState
    ? mp.remoteState.wordHint
    : null; // null means "compute locally" (local mode)

  const isArtist = mp.isMultiplayer
    ? state.players[state.currentArtistIndex]?.id === mp.playerId
    : true; // in local mode, the single device is always "the artist"

  const myPlayerId = mp.isMultiplayer ? mp.playerId : null;

  const dispatch = useCallback((action: any) => {
    if (!mp.isMultiplayer) {
      localDispatch(action);
      return;
    }

    // Map local dispatch actions to server messages
    switch (action.type) {
      case "START_GAME":
        mp.sendMessage({ type: "start-game" });
        break;
      case "ARTIST_PEEK":
        mp.sendMessage({ type: "artist-peek" });
        break;
      case "START_DRAWING":
        mp.sendMessage({ type: "start-drawing" });
        break;
      case "SUBMIT_GUESS":
        mp.sendMessage({ type: "submit-guess", text: action.text });
        break;
      case "NEXT_ROUND":
        mp.sendMessage({ type: "next-round" });
        break;
      case "SHOW_RESULTS":
        // Server transitions to results via next-round when it's the last round
        mp.sendMessage({ type: "next-round" });
        break;
      case "RESET":
        if (mp.isHost) {
          mp.sendMessage({ type: "play-again" });
        } else {
          mp.leaveRoom();
        }
        break;
      // TICK is handled server-side in multiplayer
      case "TICK":
        break;
    }
  }, [mp, localDispatch]);

  return {
    state,
    dispatch,
    isMultiplayer: mp.isMultiplayer,
    isHost: mp.isHost,
    isArtist,
    myPlayerId,
    wordHint,
  };
}
