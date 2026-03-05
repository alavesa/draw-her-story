import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import usePartySocket from "partysocket/react";
import type { GamePhase, DrawingSubPhase, Player, ChatMessage } from "./GameContext";
import type { WordEntry } from "@/data/wordBank";

// ── Types matching server messages ─────────────────────────────────────

export interface StrokeData {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  size: number;
  isEraser: boolean;
}

export interface ClientGameState {
  phase: GamePhase;
  drawingSubPhase: DrawingSubPhase;
  players: Player[];
  currentArtistIndex: number;
  roundIndex: number;
  currentWord: WordEntry | null;
  wordHint: string;
  guessedWords: WordEntry[];
  messages: ChatMessage[];
  timeRemaining: number;
  revealedHints: number;
  hostId: string;
}

interface MultiplayerContextType {
  isMultiplayer: boolean;
  isHost: boolean;
  playerId: string;
  roomCode: string;
  remoteState: ClientGameState | null;
  artistWord: WordEntry | null;
  error: string | null;
  connected: boolean;

  // Actions
  joinRoom: (roomCode: string, name: string) => void;
  createRoom: (name: string) => void;
  sendMessage: (msg: Record<string, unknown>) => void;
  leaveRoom: () => void;

  // Stroke callbacks
  onRemoteStrokes: React.MutableRefObject<((strokes: StrokeData[]) => void) | null>;
  onRemoteClear: React.MutableRefObject<(() => void) | null>;
  onRemoteUndo: React.MutableRefObject<(() => void) | null>;
}

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "localhost:1999";

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [remoteState, setRemoteState] = useState<ClientGameState | null>(null);
  const [artistWord, setArtistWord] = useState<WordEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const pendingJoin = useRef<{ name: string } | null>(null);

  // Stroke callbacks (set by DrawingCanvas)
  const onRemoteStrokes = useRef<((strokes: StrokeData[]) => void) | null>(null);
  const onRemoteClear = useRef<(() => void) | null>(null);
  const onRemoteUndo = useRef<(() => void) | null>(null);

  const ws = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomCode || "default",
    startClosed: true, // don't connect until we have a room code

    onOpen() {
      setConnected(true);
      setError(null);
      // Send pending join message
      if (pendingJoin.current) {
        ws.send(JSON.stringify({ type: "join", name: pendingJoin.current.name }));
        pendingJoin.current = null;
      }
    },

    onClose() {
      setConnected(false);
    },

    onError() {
      setError("Connection lost. Trying to reconnect...");
    },

    onMessage(event) {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "state": {
            // Extract playerId if server sent it (on join)
            if (msg.state._playerId) {
              setPlayerId(msg.state._playerId);
              delete msg.state._playerId;
            }
            setRemoteState(msg.state);
            setError(null);
            break;
          }
          case "artist-word":
            setArtistWord(msg.word);
            break;
          case "strokes":
            onRemoteStrokes.current?.(msg.data);
            break;
          case "clear-canvas":
            onRemoteClear.current?.();
            break;
          case "undo-canvas":
            onRemoteUndo.current?.();
            break;
          case "error":
            setError(msg.message);
            break;
        }
      } catch {
        // ignore parse errors
      }
    },
  });

  const joinRoom = useCallback((code: string, name: string) => {
    setRoomCode(code.toUpperCase());
    setIsMultiplayer(true);
    setArtistWord(null);
    setRemoteState(null);
    pendingJoin.current = { name };
    // Reconnect with new room
    ws.updateProperties({ room: code.toUpperCase() });
    ws.reconnect();
  }, [ws]);

  const createRoom = useCallback((name: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinRoom(code, name);
  }, [joinRoom]);

  const sendMessage = useCallback((msg: Record<string, unknown>) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, [ws]);

  const leaveRoom = useCallback(() => {
    setIsMultiplayer(false);
    setRoomCode("");
    setPlayerId("");
    setRemoteState(null);
    setArtistWord(null);
    setError(null);
    ws.close();
  }, [ws]);

  // Clear artistWord when phase changes away from drawing
  useEffect(() => {
    if (remoteState && remoteState.phase !== "drawing") {
      setArtistWord(null);
    }
  }, [remoteState?.phase]);

  const isHost = remoteState?.hostId === playerId;

  return (
    <MultiplayerContext.Provider
      value={{
        isMultiplayer,
        isHost,
        playerId,
        roomCode,
        remoteState,
        artistWord,
        error,
        connected,
        joinRoom,
        createRoom,
        sendMessage,
        leaveRoom,
        onRemoteStrokes,
        onRemoteClear,
        onRemoteUndo,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error("useMultiplayer must be used within MultiplayerProvider");
  return ctx;
}
