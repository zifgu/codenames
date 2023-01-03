import {CardData, CardTeam, Clue, GameState, PlayerData, PlayerId, Role, Score, Team, Turn} from "./types";

export interface ServerToClientEvents {
  playerJoin: (player: PlayerData) => void;
  playerJoinTeam: (playerId: PlayerId, team: Team, role: Role) => void;
  playerLeave: (playerId: PlayerId) => void;

  newClue: (playerId: PlayerId, clue: Clue, newTurn: Turn) => void;
  newGuess: (playerId: PlayerId, cardIndex: number, colour: CardTeam, newScore: Score, newTurn: Turn) => void;
  newTurn: (newTurn: Turn) => void;

  win: (winningTeam: Team) => void;
}

export interface ClientToServerEvents {
  join: (playerId: PlayerId, callback: (gameState: GameState | null) => void) => void;
  joinTeam: (team: Team, role: Role, callback: (cards?: CardData[]) => void) => void;

  submitClue: (clue: Clue) => void;
  submitGuess: (cardIndex: number) => void;
  endTurn: () => void;
}