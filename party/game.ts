import type * as Party from "partykit/server";

// ── Types (mirrored from src but standalone for the server) ─────────────

type Category = "Science" | "Arts" | "Sports" | "Activism" | "Politics" | "Literature" | "Exploration";

interface WordEntry {
  word: string;
  woman: string;
  category: Category;
  bio: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  hasGuessedCorrectly: boolean;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  type: "guess" | "correct" | "close" | "system";
  timestamp: number;
}

type GamePhase = "lobby" | "drawing" | "reveal" | "results";
type DrawingSubPhase = "showing-word" | "active";

interface RoomState {
  phase: GamePhase;
  drawingSubPhase: DrawingSubPhase;
  players: Player[];
  currentArtistIndex: number;
  roundIndex: number;
  currentWord: WordEntry | null;
  usedWords: WordEntry[];
  guessedWords: WordEntry[];
  messages: ChatMessage[];
  timeRemaining: number;
  revealedHints: number;
  hostId: string;
}

// ── Messages from client → server ──────────────────────────────────────

type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start-game" }
  | { type: "artist-peek" }
  | { type: "start-drawing" }
  | { type: "submit-guess"; text: string }
  | { type: "stroke"; data: StrokeData[] }
  | { type: "clear-canvas" }
  | { type: "undo-canvas" }
  | { type: "next-round" }
  | { type: "play-again" };

interface StrokeData {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  size: number;
  isEraser: boolean;
}

// ── Messages from server → client ──────────────────────────────────────

type ServerMessage =
  | { type: "state"; state: ClientGameState }
  | { type: "strokes"; data: StrokeData[] }
  | { type: "clear-canvas" }
  | { type: "undo-canvas" }
  | { type: "artist-word"; word: WordEntry }
  | { type: "error"; message: string };

// State sent to clients — currentWord is hidden during drawing
interface ClientGameState {
  phase: GamePhase;
  drawingSubPhase: DrawingSubPhase;
  players: Player[];
  currentArtistIndex: number;
  roundIndex: number;
  currentWord: WordEntry | null; // only sent during reveal/results
  wordHint: string;
  guessedWords: WordEntry[];
  messages: ChatMessage[];
  timeRemaining: number;
  revealedHints: number;
  hostId: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const PLAYER_COLORS = ["#E04580", "#F47A5B", "#5B8DEF", "#A855F7"];
const ROUND_TIME = 90;
const HINT_INTERVAL = 20;

// ── Word bank (embedded for server-side) ───────────────────────────────

const wordBank: WordEntry[] = [
  { word: "radioactivity", woman: "Marie Curie", category: "Science", bio: "Marie Curie was the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different sciences." },
  { word: "self-portrait", woman: "Frida Kahlo", category: "Arts", bio: "Frida Kahlo transformed personal pain into powerful art, creating over 50 self-portraits that explored identity and the human experience." },
  { word: "flying across the Atlantic", woman: "Amelia Earhart", category: "Exploration", bio: "Amelia Earhart was the first woman to fly solo across the Atlantic Ocean in 1932." },
  { word: "computer programming", woman: "Ada Lovelace", category: "Science", bio: "Ada Lovelace wrote the first computer algorithm in the 1840s, long before modern computers existed." },
  { word: "bus seat", woman: "Rosa Parks", category: "Activism", bio: "Rosa Parks refused to give up her bus seat to a white passenger in 1955, sparking the Montgomery Bus Boycott." },
  { word: "diary in hiding", woman: "Anne Frank", category: "Literature", bio: "Anne Frank wrote a diary while hiding from the Nazis during World War II, capturing the human spirit amid unimaginable horror." },
  { word: "telescope and stars", woman: "Vera Rubin", category: "Science", bio: "Vera Rubin's observations of galaxy rotation provided the first strong evidence for the existence of dark matter." },
  { word: "gorillas in the mist", woman: "Dian Fossey", category: "Science", bio: "Dian Fossey dedicated her life to studying and protecting mountain gorillas in Rwanda." },
  { word: "tennis Grand Slam", woman: "Serena Williams", category: "Sports", bio: "Serena Williams won 23 Grand Slam singles titles, the most in the Open Era." },
  { word: "malaria vaccine", woman: "Tu Youyou", category: "Science", bio: "Tu Youyou discovered artemisinin, a treatment for malaria that has saved millions of lives worldwide." },
  { word: "Nobel Peace Prize youngest", woman: "Malala Yousafzai", category: "Activism", bio: "Malala Yousafzai survived a Taliban assassination attempt and became the youngest Nobel Peace Prize laureate at age 17." },
  { word: "space walk", woman: "Valentina Tereshkova", category: "Exploration", bio: "Valentina Tereshkova became the first woman in space in 1963, orbiting Earth 48 times." },
  { word: "Underground Railroad", woman: "Harriet Tubman", category: "Activism", bio: "Harriet Tubman escaped slavery and led hundreds of others to freedom through the Underground Railroad." },
  { word: "ballet shoes", woman: "Misty Copeland", category: "Arts", bio: "Misty Copeland became the first African American woman to be named principal dancer at American Ballet Theatre." },
  { word: "equal pay lawsuit", woman: "Lilly Ledbetter", category: "Activism", bio: "Lilly Ledbetter's fight against pay discrimination led to the Lilly Ledbetter Fair Pay Act of 2009." },
  { word: "DNA photograph", woman: "Rosalind Franklin", category: "Science", bio: "Rosalind Franklin's X-ray crystallography images were crucial to discovering DNA's double helix structure." },
  { word: "courtroom gavel", woman: "Ruth Bader Ginsburg", category: "Politics", bio: "Ruth Bader Ginsburg served as a Supreme Court Justice and championed gender equality throughout her career." },
  { word: "chemistry flask", woman: "Dorothy Hodgkin", category: "Science", bio: "Dorothy Hodgkin used X-ray crystallography to determine structures of biochemical substances including penicillin and insulin." },
  { word: "marathon finish line", woman: "Kathrine Switzer", category: "Sports", bio: "Kathrine Switzer became the first woman to officially run the Boston Marathon in 1967." },
  { word: "tree planting", woman: "Wangari Maathai", category: "Activism", bio: "Wangari Maathai founded the Green Belt Movement and planted over 51 million trees across Kenya." },
  { word: "space shuttle", woman: "Mae Jemison", category: "Exploration", bio: "Mae Jemison became the first African American woman to travel in space in 1992." },
  { word: "novel writing", woman: "Jane Austen", category: "Literature", bio: "Jane Austen's novels, including Pride and Prejudice, are considered among the greatest works of English literature." },
  { word: "surgical operation", woman: "Virginia Apgar", category: "Science", bio: "Virginia Apgar developed the Apgar Score, which has saved countless newborn lives worldwide." },
  { word: "Olympic gold medal", woman: "Wilma Rudolph", category: "Sports", bio: "Wilma Rudolph overcame polio to become the first American woman to win three gold medals in a single Olympics." },
  { word: "painting water lilies", woman: "Georgia O'Keeffe", category: "Arts", bio: "Georgia O'Keeffe is known as the Mother of American Modernism for her iconic paintings of flowers and landscapes." },
  { word: "ancient Egypt queen", woman: "Cleopatra", category: "Politics", bio: "Cleopatra was the last active ruler of the Ptolemaic Kingdom of Egypt, known for her intelligence and political alliances." },
  { word: "ocean diving", woman: "Sylvia Earle", category: "Exploration", bio: "Sylvia Earle is a pioneering marine biologist who has led over 100 expeditions and spent more than 7,000 hours underwater." },
  { word: "suffragette march", woman: "Emmeline Pankhurst", category: "Activism", bio: "Emmeline Pankhurst led the British suffragette movement, fighting tirelessly for women's right to vote." },
];

// ── Helpers ────────────────────────────────────────────────────────────

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

  const maxTypos = Math.max(2, Math.floor(w.length / 4));
  const dist = levenshtein(g, w);
  if (dist <= maxTypos) return "correct";

  const words = w.split(" ");
  const matchCount = words.filter(part => {
    if (part.length <= 2) return false;
    if (g.includes(part)) return true;
    return g.split(" ").some(gw => levenshtein(gw, part) <= Math.max(1, Math.floor(part.length / 4)));
  }).length;
  if (matchCount >= Math.ceil(words.length * 0.6)) return "correct";
  if (matchCount > 0) return "close";
  if (dist <= maxTypos + 2) return "close";

  return "wrong";
}

function getRandomWord(used: WordEntry[]): WordEntry {
  const available = wordBank.filter(w => !used.some(u => u.word === w.word));
  if (available.length === 0) return wordBank[Math.floor(Math.random() * wordBank.length)];
  return available[Math.floor(Math.random() * available.length)];
}

function generateWordHint(word: WordEntry | null, revealedHints: number): string {
  if (!word) return "";
  const w = word.word;
  const letters = w.split("");
  const revealable = letters.map((ch, i) => ({ ch, i })).filter(({ ch }) => ch !== " ");
  const maxReveal = Math.min(revealedHints, Math.floor(revealable.length * 0.6));

  // Deterministic reveal based on word (same hint for all clients)
  const revealIndices = new Set<number>();
  for (let r = 0; r < maxReveal; r++) {
    const idx = Math.floor((r * 7 + 3) % revealable.length);
    revealIndices.add(revealable[idx].i);
  }

  return letters.map((ch, i) => {
    if (ch === " ") return "  ";
    if (revealIndices.has(i)) return ch;
    return "_";
  }).join(" ");
}

// ── PartyKit Server ────────────────────────────────────────────────────

export default class GameRoom implements Party.Server {
  state: RoomState;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  connectionPlayerMap = new Map<string, string>(); // connectionId → playerId

  constructor(readonly room: Party.Room) {
    this.state = {
      phase: "lobby",
      drawingSubPhase: "showing-word",
      players: [],
      currentArtistIndex: 0,
      roundIndex: 0,
      currentWord: null,
      usedWords: [],
      guessedWords: [],
      messages: [],
      timeRemaining: ROUND_TIME,
      revealedHints: 0,
      hostId: "",
    };
  }

  onConnect(conn: Party.Connection) {
    // Send current state to newly connected client
    this.sendToConnection(conn, {
      type: "state",
      state: this.getClientState(),
    });
  }

  onClose(conn: Party.Connection) {
    const playerId = this.connectionPlayerMap.get(conn.id);
    if (!playerId) return;
    this.connectionPlayerMap.delete(conn.id);

    // Don't remove player, just mark disconnected (they might reconnect)
    // If host disconnects during lobby, pick new host
    if (playerId === this.state.hostId && this.state.phase === "lobby") {
      const remaining = this.state.players.filter(p => {
        for (const [, pid] of this.connectionPlayerMap) {
          if (pid === p.id) return true;
        }
        return false;
      });
      if (remaining.length > 0) {
        this.state.hostId = remaining[0].id;
      }
    }
    this.broadcastState();
  }

  onMessage(rawMessage: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(rawMessage);
    } catch {
      return;
    }

    const playerId = this.connectionPlayerMap.get(sender.id);

    switch (msg.type) {
      case "join":
        this.handleJoin(sender, msg.name);
        break;
      case "start-game":
        if (playerId === this.state.hostId) this.handleStartGame();
        break;
      case "artist-peek":
        if (playerId && this.isCurrentArtist(playerId)) {
          this.state.drawingSubPhase = "showing-word";
          this.broadcastState();
        }
        break;
      case "start-drawing":
        if (playerId && this.isCurrentArtist(playerId)) {
          this.state.drawingSubPhase = "active";
          this.startTimer();
          this.broadcastState();
        }
        break;
      case "submit-guess":
        if (playerId) this.handleGuess(playerId, msg.text);
        break;
      case "stroke":
        if (playerId && this.isCurrentArtist(playerId)) {
          // Broadcast strokes to all OTHER connections
          for (const conn of this.room.getConnections()) {
            if (conn.id !== sender.id) {
              this.sendToConnection(conn, { type: "strokes", data: msg.data });
            }
          }
        }
        break;
      case "clear-canvas":
        if (playerId && this.isCurrentArtist(playerId)) {
          for (const conn of this.room.getConnections()) {
            if (conn.id !== sender.id) {
              this.sendToConnection(conn, { type: "clear-canvas" });
            }
          }
        }
        break;
      case "undo-canvas":
        if (playerId && this.isCurrentArtist(playerId)) {
          for (const conn of this.room.getConnections()) {
            if (conn.id !== sender.id) {
              this.sendToConnection(conn, { type: "undo-canvas" });
            }
          }
        }
        break;
      case "next-round":
        if (playerId === this.state.hostId) this.handleNextRound();
        break;
      case "play-again":
        if (playerId === this.state.hostId) this.handlePlayAgain();
        break;
    }
  }

  // ── Game Logic ─────────────────────────────────────────────────────

  handleJoin(conn: Party.Connection, name: string) {
    // Sanitize and validate name
    if (typeof name !== "string") return;
    const safeName = name.trim().slice(0, 16);
    if (safeName.length === 0) {
      this.sendToConnection(conn, { type: "error", message: "Name is required" });
      return;
    }
    if (this.state.phase !== "lobby") {
      this.sendToConnection(conn, { type: "error", message: "Game already in progress" });
      return;
    }
    if (this.state.players.length >= 4) {
      this.sendToConnection(conn, { type: "error", message: "Room is full" });
      return;
    }

    const playerId = `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.connectionPlayerMap.set(conn.id, playerId);

    const player: Player = {
      id: playerId,
      name: safeName,
      score: 0,
      color: PLAYER_COLORS[this.state.players.length],
      hasGuessedCorrectly: false,
    };

    this.state.players.push(player);

    // First player is host
    if (this.state.players.length === 1) {
      this.state.hostId = playerId;
    }

    // Tell the joining client their playerId
    this.sendToConnection(conn, {
      type: "state",
      state: { ...this.getClientState(), _playerId: playerId } as any,
    });

    this.broadcastState();
  }

  handleStartGame() {
    if (this.state.players.length < 2) return;

    const word = getRandomWord([]);
    this.state = {
      ...this.state,
      phase: "drawing",
      drawingSubPhase: "showing-word",
      currentArtistIndex: 0,
      roundIndex: 0,
      currentWord: word,
      usedWords: [word],
      guessedWords: [],
      messages: [{
        id: "sys-start",
        playerId: "system",
        playerName: "System",
        text: `${this.state.players[0].name} is drawing!`,
        type: "system",
        timestamp: Date.now(),
      }],
      timeRemaining: ROUND_TIME,
      revealedHints: 0,
      players: this.state.players.map(p => ({ ...p, hasGuessedCorrectly: false, score: 0 })),
    };

    this.broadcastState();
    this.sendWordToArtist();
  }

  handleGuess(playerId: string, text: string) {
    if (this.state.phase !== "drawing" || this.state.drawingSubPhase !== "active") return;
    if (!this.state.currentWord) return;
    // Validate guess text
    if (typeof text !== "string" || text.trim().length === 0 || text.length > 100) return;

    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.hasGuessedCorrectly) return;
    if (this.isCurrentArtist(playerId)) return;

    const result = checkGuess(text, this.state.currentWord.word);
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      playerId,
      playerName: player.name,
      text: result === "close" ? `${text} — Almost!` : text,
      type: result === "correct" ? "correct" : result === "close" ? "close" : "guess",
      timestamp: Date.now(),
    };

    this.state.messages.push(msg);

    if (result === "correct") {
      const timeBonus = Math.floor(this.state.timeRemaining * 2);
      const basePoints = 100;
      player.score += basePoints + timeBonus;
      player.hasGuessedCorrectly = true;

      const artist = this.state.players[this.state.currentArtistIndex];
      if (artist) artist.score += 50;

      this.state.messages.push({
        id: `sys-${Date.now()}`,
        playerId: "system",
        playerName: "System",
        text: `🎉 ${player.name} guessed correctly! (+${basePoints + timeBonus} pts)`,
        type: "system",
        timestamp: Date.now(),
      });

      // Check if all guessers got it
      const allGuessed = this.state.players.every(
        (p, i) => i === this.state.currentArtistIndex || p.hasGuessedCorrectly
      );
      if (allGuessed) {
        this.endRound(true);
        return;
      }
    }

    this.broadcastState();
  }

  handleNextRound() {
    const nextArtist = this.state.currentArtistIndex + 1;
    if (nextArtist >= this.state.players.length) {
      this.state.phase = "results";
      this.broadcastState();
      return;
    }

    const word = getRandomWord(this.state.usedWords);
    this.state = {
      ...this.state,
      phase: "drawing",
      drawingSubPhase: "showing-word",
      currentArtistIndex: nextArtist,
      roundIndex: this.state.roundIndex + 1,
      currentWord: word,
      usedWords: [...this.state.usedWords, word],
      messages: [{
        id: `sys-r${nextArtist}`,
        playerId: "system",
        playerName: "System",
        text: `${this.state.players[nextArtist].name} is drawing!`,
        type: "system",
        timestamp: Date.now(),
      }],
      timeRemaining: ROUND_TIME,
      revealedHints: 0,
      players: this.state.players.map(p => ({ ...p, hasGuessedCorrectly: false })),
    };

    this.broadcastState();
    this.sendWordToArtist();
  }

  handlePlayAgain() {
    this.state = {
      ...this.state,
      phase: "lobby",
      drawingSubPhase: "showing-word",
      currentArtistIndex: 0,
      roundIndex: 0,
      currentWord: null,
      usedWords: [],
      guessedWords: [],
      messages: [],
      timeRemaining: ROUND_TIME,
      revealedHints: 0,
      players: this.state.players.map(p => ({ ...p, score: 0, hasGuessedCorrectly: false })),
    };
    this.broadcastState();
  }

  endRound(guessed: boolean) {
    this.stopTimer();
    if (guessed && this.state.currentWord) {
      this.state.guessedWords.push(this.state.currentWord);
    }
    this.state.phase = "reveal";
    this.broadcastState();
  }

  // ── Timer ──────────────────────────────────────────────────────────

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.state.phase !== "drawing" || this.state.drawingSubPhase !== "active") {
        this.stopTimer();
        return;
      }

      this.state.timeRemaining -= 1;

      // Reveal hints
      const expectedHints = Math.floor((ROUND_TIME - this.state.timeRemaining) / HINT_INTERVAL);
      this.state.revealedHints = Math.max(this.state.revealedHints, expectedHints);

      if (this.state.timeRemaining <= 0) {
        this.state.timeRemaining = 0;
        this.endRound(false);
        return;
      }

      this.broadcastState();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────

  isCurrentArtist(playerId: string): boolean {
    const artist = this.state.players[this.state.currentArtistIndex];
    return artist?.id === playerId;
  }

  sendWordToArtist() {
    if (!this.state.currentWord) return;
    const artist = this.state.players[this.state.currentArtistIndex];
    if (!artist) return;

    // Find the connection for the artist
    for (const [connId, pid] of this.connectionPlayerMap) {
      if (pid === artist.id) {
        const conn = this.room.getConnection(connId);
        if (conn) {
          this.sendToConnection(conn, {
            type: "artist-word",
            word: this.state.currentWord,
          });
        }
        break;
      }
    }
  }

  getClientState(): ClientGameState {
    const showWord = this.state.phase === "reveal" || this.state.phase === "results";
    return {
      phase: this.state.phase,
      drawingSubPhase: this.state.drawingSubPhase,
      players: this.state.players,
      currentArtistIndex: this.state.currentArtistIndex,
      roundIndex: this.state.roundIndex,
      currentWord: showWord ? this.state.currentWord : null,
      wordHint: generateWordHint(this.state.currentWord, this.state.revealedHints),
      guessedWords: this.state.guessedWords,
      messages: this.state.messages,
      timeRemaining: this.state.timeRemaining,
      revealedHints: this.state.revealedHints,
      hostId: this.state.hostId,
    };
  }

  broadcastState() {
    const clientState = this.getClientState();
    for (const conn of this.room.getConnections()) {
      this.sendToConnection(conn, { type: "state", state: clientState });
    }
  }

  sendToConnection(conn: Party.Connection, msg: ServerMessage | (ServerMessage & { state: any })) {
    conn.send(JSON.stringify(msg));
  }
}
