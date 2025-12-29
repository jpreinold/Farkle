import storage from "./storage";

const SESSION_KEY_PREFIX = "FARKLE_SESSION_";
const SESSION_INDEX_KEY = "FARKLE_SESSION_INDEX";
const ACTIVE_SESSION_KEY = "FARKLE_ACTIVE_SESSION";

export type ScoreSource = "auto" | "manual";

export interface StoredScoreEntry {
  id: number;
  player: string;
  score: number;
  note: string;
  source: ScoreSource;
}

export type GameSessionStatus = "in-progress" | "completed";

export interface GameSessionState {
  id: string;
  players: string[];
  targetScore: number;
  scores: StoredScoreEntry[];
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: string;
  status: GameSessionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type GameSessionSummary = Pick<
  GameSessionState,
  | "id"
  | "players"
  | "targetScore"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "completedAt"
  | "winner"
>;

const now = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const sessionKey = (id: string) => `${SESSION_KEY_PREFIX}${id}`;

const readIndex = async (): Promise<GameSessionSummary[]> => {
  const raw = await storage.getItem(SESSION_INDEX_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error parsing session index:", error);
    return [];
  }
};

const writeIndex = async (items: GameSessionSummary[]) => {
  await storage.setItem(SESSION_INDEX_KEY, JSON.stringify(items));
};

const upsertSummary = async (session: GameSessionState) => {
  const index = await readIndex();
  const summary: GameSessionSummary = {
    id: session.id,
    players: session.players,
    targetScore: session.targetScore,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    completedAt: session.completedAt,
    winner: session.winner,
  };

  const filtered = index.filter((item) => item.id !== session.id);
  await writeIndex([summary, ...filtered]);
};

const saveSession = async (session: GameSessionState) => {
  await storage.setItem(sessionKey(session.id), JSON.stringify(session));
};

export const createSession = async (params: {
  players: string[];
  targetScore: number;
}): Promise<GameSessionState> => {
  const id = generateId();
  const timestamp = now();
  const session: GameSessionState = {
    id,
    players: params.players,
    targetScore: params.targetScore,
    scores: [],
    currentPlayerIndex: 0,
    gameOver: false,
    winner: "",
    status: "in-progress",
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
  await saveSession(session);
  await upsertSummary(session);
  await setActiveSession(id);
  return session;
};

export const loadSession = async (
  id: string
): Promise<GameSessionState | null> => {
  const raw = await storage.getItem(sessionKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameSessionState;
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
};

export const updateSessionState = async (
  id: string,
  updates: Partial<GameSessionState>
): Promise<GameSessionState | null> => {
  const existing = await loadSession(id);
  if (!existing) return null;

  const next: GameSessionState = {
    ...existing,
    ...updates,
  };

  const isCompleted = next.gameOver || next.status === "completed";
  next.status = isCompleted ? "completed" : "in-progress";
  if (next.status === "completed") {
    next.completedAt =
      updates.completedAt ?? existing.completedAt ?? now();
  } else {
    next.completedAt = null;
  }

  next.updatedAt = updates.updatedAt ?? now();

  await saveSession(next);
  await upsertSummary(next);
  return next;
};

export const listSessions = async (): Promise<GameSessionSummary[]> => {
  const items = await readIndex();
  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const setActiveSession = async (id: string | null) => {
  if (!id) {
    await storage.removeItem(ACTIVE_SESSION_KEY);
    return;
  }
  await storage.setItem(ACTIVE_SESSION_KEY, id);
};

export const getActiveSessionId = async (): Promise<string | null> => {
  return storage.getItem(ACTIVE_SESSION_KEY);
};

export const removeSession = async (id: string) => {
  await storage.removeItem(sessionKey(id));
  const index = await readIndex();
  await writeIndex(index.filter((item) => item.id !== id));
  const activeId = await getActiveSessionId();
  if (activeId === id) {
    await setActiveSession(null);
  }
};

export const clearAllSessions = async () => {
  const index = await readIndex();
  await Promise.all(index.map((item) => storage.removeItem(sessionKey(item.id))));
  await storage.removeItem(SESSION_INDEX_KEY);
  await storage.removeItem(ACTIVE_SESSION_KEY);
};


