import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '../redux/store'
import {
  CardData,
  CardTeam,
  Clue,
  GameState,
  PlayerData,
  PlayerId, Players,
  Role, RoomId, Score,
  Team, Turn
} from "../types/types";

interface RoomState {
  game: GameState | null,
  players: Players,
  playerId: PlayerId,
  roomId: RoomId,
}

const defaultState = (): RoomState => ({
  game: null,
  players: {},
  playerId: "",
  roomId: "",
});

const getPlayerTeam = (state: RoomState) => state.players[state.playerId].team;
const getPlayerRole = (state: RoomState) => state.players[state.playerId].role;
const isPlayerTurn = (state: RoomState) => state.game && getPlayerTeam(state) === state.game.turn.team && getPlayerRole(state) === state.game.turn.role;

export const gameSlice = createSlice({
  name: 'room',
  initialState: defaultState(),
  reducers: {
    reset: () => {
      return defaultState();
    },
    setPlayer: (state, action: PayloadAction<PlayerId>) => {
      state.playerId = action.payload;
    },
    setRoomId: (state, action: PayloadAction<RoomId>) => {
      state.roomId = action.payload;
    },
    setWinner: (state, action: PayloadAction<Team>) => {
      if (!state.game) return;

      state.game.winner = action.payload;
    },
    setGame: (state, action: PayloadAction<GameState | null>) => {
      state.game = action.payload;
    },
    setPlayers: (state, action: PayloadAction<Players>) => {
      state.players = action.payload;
    },
    clearPlayerTeams: (state) => {
      for (let player of Object.values(state.players)) {
        player.team = null;
        player.role = null;
      }
    },
    addPlayer: (state, action: PayloadAction<PlayerData>) => {
      state.players[action.payload.id] = action.payload;
    },
    addPlayerToTeam: (state, action: PayloadAction<{ playerId: PlayerId, team: Team, role: Role }>) => {
      if (!state.game) return;

      const {playerId, role, team} = action.payload;

      if (!state.players[playerId].team && !state.players[playerId].role) {
        state.players[playerId].team = team;
        state.players[playerId].role = role;

        if (role === Role.SPYMASTER) {
          state.game.teams[team][role] = playerId;
        } else {
          state.game.teams[team][role].push(playerId);
        }
      }
    },
    removePlayer: (state, action: PayloadAction<PlayerId>) => {
      const playerId = action.payload;
      if (state.game) {
        const playerId = action.payload;
        if (state.game.teams[CardTeam.RED][Role.SPYMASTER] === playerId) {
          state.game.teams[CardTeam.RED][Role.SPYMASTER] = null;
        } else if (state.game.teams[CardTeam.BLUE][Role.SPYMASTER] === playerId) {
          state.game.teams[CardTeam.BLUE][Role.SPYMASTER] = null;
        } else {
          state.game.teams[CardTeam.RED][Role.OPERATIVE] = state.game.teams[CardTeam.RED][Role.OPERATIVE].filter((id) => id !== playerId);
          state.game.teams[CardTeam.BLUE][Role.OPERATIVE] = state.game.teams[CardTeam.BLUE][Role.OPERATIVE].filter((id) => id !== playerId);
        }
      }

      delete state.players[playerId];
    },
    addClue: (state, action: PayloadAction<Clue>) => {
      if (!state.game) return;

      state.game.pastClues.push(action.payload);
    },
    setScore: (state, action: PayloadAction<Score>) => {
      if (!state.game) return;

      state.game.score = action.payload;
    },
    setCards: (state, action: PayloadAction<CardData[]>) => {
      if (!state.game) return;

      state.game.cards = action.payload;
    },
    revealCard: (state, action: PayloadAction<{ cardIndex: number, colour: CardTeam }>) => {
      if (!state.game) return;

      const {cardIndex, colour} = action.payload;

      state.game.cards[cardIndex].team = colour;
      state.game.cards[cardIndex].revealed = true;
    },
    setTurn: (state, action: PayloadAction<Turn>) => {
      if (!state.game) return;

      state.game.turn = action.payload;
    },
  },
});

export const {
  reset,
  setPlayer,
  setRoomId,
  setWinner,
  setGame,
  setPlayers,
  clearPlayerTeams,
  addPlayer,
  addPlayerToTeam,
  addClue,
  removePlayer,
  setScore,
  setTurn,
  revealCard,
  setCards
} = gameSlice.actions;

export const selectRoomId = (state: RootState) => state.room.roomId;
export const selectGame = (state: RootState) => state.room.game;
export const selectPlayers = (state: RootState) => state.room.players;
export const selectScore = (state: RootState) => state.room.game ? state.room.game.score : null;
export const selectWinner = (state: RootState) => state.room.game ? state.room.game.winner : null;
export const selectPlayerTeam = (state: RootState) => getPlayerTeam(state.room);
export const selectPlayerRole = (state: RootState) => getPlayerRole(state.room);
export const selectIsPlayerTurn = (state: RootState) => isPlayerTurn(state.room);
export const selectLatestClue = (state: RootState) => state.room.game && state.room.game.pastClues[state.room.game.pastClues.length - 1];

export default gameSlice.reducer;
