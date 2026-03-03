import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { wordBank, WordEntry } from "@/data/wordBank";

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  hasGuessedCorrectly: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  type: "guess" | "correct" | "close" | "system";
  timestamp: number;
}

export type GamePhase = "landing" | "lobby" | "drawing" | "reveal" | "results";
export type DrawingSubPhase = "pass-to-artist" | "showing-word" | "active";

export interface GameState {
  phase: GamePhase;
  drawingSubPhase: DrawingSubPhase;
  players: Player[];
  currentPlayerIndex: number;
  currentArtistIndex: number;
  roundIndex: number;
  currentWord: WordEntry | null;
  usedWords: WordEntry[];
  guessedWords: WordEntry[];
  messages: ChatMessage[];
  timeRemaining: number;
  revealedHints: number;
  roomCode: string;
  hostId: string;
}

const PLAYER_COLORS = ["#7C3AED", "#F59E0B", "#EF4444", "#3B82F6"];

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomWord(used: WordEntry[]): WordEntry {
  const available = wordBank.filter(w => !used.some(u => u.word === w.word));
  if (available.length === 0) return wordBank[Math.floor(Math.random() * wordBank.length)];
  return available[Math.floor(Math.random() * available.length)];
}

type GameAction =
  | { type: "CREATE_ROOM"; playerName: string }
  | { type: "JOIN_ROOM"; playerName: string }
  | { type: "START_GAME" }
  | { type: "SUBMIT_GUESS"; playerId: string; text: string }
  | { type: "ARTIST_PEEK" }
  | { type: "START_DRAWING" }
  | { type: "TICK" }
  | { type: "REVEAL_HINT" }
  | { type: "END_ROUND" }
  | { type: "NEXT_ROUND" }
  | { type: "SHOW_RESULTS" }
  | { type: "RESET" };

const initialState: GameState = {
  phase: "landing",
  drawingSubPhase: "pass-to-artist",
  players: [],
  currentPlayerIndex: 0,
  currentArtistIndex: 0,
  roundIndex: 0,
  currentWord: null,
  usedWords: [],
  guessedWords: [],
  messages: [],
  timeRemaining: 90,
  revealedHints: 0,
  roomCode: "",
  hostId: "",
};

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function checkGuess(guess: string, word: string): "correct" | "close" | "wrong" {
  const g = guess.toLowerCase().trim();
  const w = word.toLowerCase().trim();
  if (g === w) return "correct";

  // Full-word typo tolerance: allow ~1 typo per 4 characters
  const maxTypos = Math.max(2, Math.floor(w.length / 4));
  const dist = levenshtein(g, w);
  if (dist <= maxTypos) return "correct";

  // Check if guess contains the main keyword (with typo tolerance per word)
  const words = w.split(" ");
  const matchCount = words.filter(part => {
    if (part.length <= 2) return false;
    if (g.includes(part)) return true;
    // Check each word in the guess against this word part
    return g.split(" ").some(gw => levenshtein(gw, part) <= Math.max(1, Math.floor(part.length / 4)));
  }).length;
  if (matchCount >= Math.ceil(words.length * 0.6)) return "correct";
  if (matchCount > 0) return "close";

  // Close if edit distance is within a wider margin
  if (dist <= maxTypos + 2) return "close";

  return "wrong";
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CREATE_ROOM": {
      const player: Player = {
        id: "p1",
        name: action.playerName,
        score: 0,
        color: PLAYER_COLORS[0],
        hasGuessedCorrectly: false,
      };
      return {
        ...state,
        phase: "lobby",
        players: [player],
        roomCode: generateRoomCode(),
        hostId: "p1",
      };
    }
    case "JOIN_ROOM": {
      const idx = state.players.length;
      if (idx >= 4) return state;
      const player: Player = {
        id: `p${idx + 1}`,
        name: action.playerName,
        score: 0,
        color: PLAYER_COLORS[idx],
        hasGuessedCorrectly: false,
      };
      return { ...state, players: [...state.players, player] };
    }
    case "START_GAME": {
      const word = getRandomWord([]);
      return {
        ...state,
        phase: "drawing",
        drawingSubPhase: "pass-to-artist",
        currentArtistIndex: 0,
        roundIndex: 0,
        currentWord: word,
        usedWords: [word],
        guessedWords: [],
        messages: [{ id: "sys-start", playerId: "system", playerName: "System", text: `${state.players[0].name} is drawing!`, type: "system", timestamp: Date.now() }],
        timeRemaining: 90,
        revealedHints: 0,
        players: state.players.map(p => ({ ...p, hasGuessedCorrectly: false, score: 0 })),
      };
    }
    case "ARTIST_PEEK":
      return { ...state, drawingSubPhase: "showing-word" };
    case "START_DRAWING":
      return { ...state, drawingSubPhase: "active" };
    case "SUBMIT_GUESS": {
      const player = state.players.find(p => p.id === action.playerId);
      if (!player || player.hasGuessedCorrectly || player.id === state.players[state.currentArtistIndex].id) return state;
      if (!state.currentWord) return state;

      const result = checkGuess(action.text, state.currentWord.word);
      const msg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        playerId: action.playerId,
        playerName: player.name,
        text: action.text,
        type: result === "correct" ? "correct" : result === "close" ? "close" : "guess",
        timestamp: Date.now(),
      };

      let updatedPlayers = state.players;
      let updatedMessages = [...state.messages, msg];

      if (result === "correct") {
        const timeBonus = Math.floor(state.timeRemaining * 2);
        const basePoints = 100;
        updatedPlayers = state.players.map(p => {
          if (p.id === action.playerId) return { ...p, score: p.score + basePoints + timeBonus, hasGuessedCorrectly: true };
          if (p.id === state.players[state.currentArtistIndex].id) return { ...p, score: p.score + 50 };
          return p;
        });
        updatedMessages.push({
          id: `sys-${Date.now()}`,
          playerId: "system",
          playerName: "System",
          text: `🎉 ${player.name} guessed correctly! (+${basePoints + timeBonus} pts)`,
          type: "system",
          timestamp: Date.now(),
        });
      } else if (result === "close") {
        updatedMessages[updatedMessages.length - 1] = {
          ...msg,
          text: `${action.text} — Almost!`,
          type: "close",
        };
      }

      // Check if all non-artist players guessed correctly
      const allGuessed = updatedPlayers.every(
        (p, i) => i === state.currentArtistIndex || p.hasGuessedCorrectly
      );

      return {
        ...state,
        players: updatedPlayers,
        messages: updatedMessages,
        phase: allGuessed ? "reveal" : state.phase,
        guessedWords: allGuessed && state.currentWord
          ? [...state.guessedWords, state.currentWord]
          : state.guessedWords,
      };
    }
    case "TICK": {
      if (state.drawingSubPhase !== "active") return state;
      const newTime = state.timeRemaining - 1;
      if (newTime <= 0) return { ...state, timeRemaining: 0, phase: "reveal" };
      // Reveal hints at intervals
      const hintInterval = 20;
      const expectedHints = Math.floor((90 - newTime) / hintInterval);
      return {
        ...state,
        timeRemaining: newTime,
        revealedHints: Math.max(state.revealedHints, expectedHints),
      };
    }
    case "END_ROUND":
      return { ...state, timeRemaining: 0, phase: "reveal" };
    case "NEXT_ROUND": {
      const nextArtist = state.currentArtistIndex + 1;
      if (nextArtist >= state.players.length) {
        return { ...state, phase: "results" };
      }
      const word = getRandomWord(state.usedWords);
      return {
        ...state,
        phase: "drawing",
        drawingSubPhase: "pass-to-artist",
        currentArtistIndex: nextArtist,
        roundIndex: state.roundIndex + 1,
        currentWord: word,
        usedWords: [...state.usedWords, word],
        messages: [{ id: `sys-r${nextArtist}`, playerId: "system", playerName: "System", text: `${state.players[nextArtist].name} is drawing!`, type: "system", timestamp: Date.now() }],
        timeRemaining: 90,
        revealedHints: 0,
        players: state.players.map(p => ({ ...p, hasGuessedCorrectly: false })),
      };
    }
    case "SHOW_RESULTS":
      return { ...state, phase: "results" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
