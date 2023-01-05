import {
  CardData,
  CardTeam,
  Clue,
  GameState,
  PlayerData,
  PlayerId,
  Players,
  Role,
  RoomId,
  Score,
  Team,
  Turn
} from "./types";

export interface ServerToClientEvents {
  playerJoin: (player: PlayerData) => void;
  playerJoinTeam: (playerId: PlayerId, team: Team, role: Role) => void;
  playerLeave: (playerId: PlayerId) => void;

  newClue: (playerId: PlayerId, clue: Clue, newTurn: Turn) => void;
  newGuess: (playerId: PlayerId, cardIndex: number, colour: CardTeam, newScore: Score, newTurn: Turn) => void;
  newTurn: (newTurn: Turn) => void;

  win: (winningTeam: Team, cards: CardData[]) => void;
  newGame: (gameState: GameState) => void;
}

export interface ClientToServerEvents {
  createGame: (playerId: PlayerId, startingTeam: Team, callback: (roomId: RoomId, gameState: GameState) => void) => void;
  joinGame: (
    playerId: PlayerId,
    roomId: RoomId,
    callback: (roomId: RoomId | null, players: Players | null, gameState: GameState | null) => void
  ) => void;
  joinTeam: (team: Team, role: Role, callback: (cards?: CardData[]) => void) => void;
  leaveGame: () => void;

  submitClue: (clue: Clue) => void;
  submitGuess: (cardIndex: number) => void;
  endTurn: () => void;

  resetGame: (startingTeam: Team) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomId: RoomId;
  playerId: PlayerId;
}