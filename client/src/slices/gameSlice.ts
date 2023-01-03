import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '../redux/store'
import {
  CardData,
  CardTeam,
  Clue,
  GameState,
  PlayerData,
  PlayerId,
  Role, Score,
  Team, Turn
} from "../types/types";

interface State {
  game: GameState | null,
  playerId: string,
  winner: null | Team,
}

const initialState: State = {
  game: null,
  playerId: "",
  winner: null,
};

const getPlayerTeam = (state: State) => state.game?.players[state.playerId].team;
const getPlayerRole = (state: State) => state.game?.players[state.playerId].role;
const isPlayerTurn = (state: State) => state.game && getPlayerTeam(state) === state.game.turn.team && getPlayerRole(state) === state.game.turn.role;

export const gameSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<string>) => {
      state.playerId = action.payload;
    },
    setGame: (state, action: PayloadAction<GameState | null>) => {
      state.game = action.payload;
    },
    addPlayer: (state, action: PayloadAction<PlayerData>) => {
      if (!state.game) return;

      state.game.players[action.payload.id] = action.payload;
    },
    addPlayerToTeam: (state, action: PayloadAction<{ playerId: PlayerId, team: Team, role: Role }>) => {
      if (!state.game) return;

      const {playerId, role, team} = action.payload;

      // TODO: validation
      state.game.players[playerId].team = team;
      state.game.players[playerId].role = role;

      if (role === Role.SPYMASTER) {
        state.game.teams[team][role] = playerId;
      } else {
        state.game.teams[team][role].push(playerId);
      }
    },
    removePlayer: (state, action: PayloadAction<PlayerId>) => {
      if (!state.game) return;

      const {id: playerId, role, team} = state.game.players[action.payload];
      // TODO: look in other places
      if (team !== undefined && role !== undefined) {
        if (role === Role.SPYMASTER) {
          state.game.teams[team][role] = null;
        } else {
          state.game.teams[team][role] = state.game.teams[team][role].filter((id) => id !== playerId);
        }
      }
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
    // giveClue: (state, action: PayloadAction<{word: string, number: number}>) => {
    //   const playerTeam = getPlayerTeam(state);
    //
    //   if (playerTeam && state.turn.role === Role.SPYMASTER && isPlayerTurn(state)) {
    //     state.pastClues.push({...action.payload, team: playerTeam});
    //
    //     state.turn.hintNumber = action.payload.number + 1;
    //     state.turn.guessesLeft = state.turn.hintNumber;
    //     state.turn.role = Role.OPERATIVE;
    //   }
    // },
    // revealCard: (state, action: PayloadAction<number>) => {
    //   const playerTeam = getPlayerTeam(state);
    //   const card = state.cards[action.payload];
    //
    //   if (state.turn.role === Role.OPERATIVE && isPlayerTurn(state) && state.turn.guessesLeft > 0 && !card.revealed) {
    //     card.revealed = true;
    //
    //     if (card.team === playerTeam) {
    //       state.turn.guessesLeft -= 1;
    //     } else {
    //       state.turn.guessesLeft = 0;
    //     }
    //
    //     if (card.team === CardTeam.RED || card.team === CardTeam.BLUE) {
    //       state.score[card.team]++;
    //
    //       if (state.score[card.team] >= state.targetScore[card.team]) {
    //         state.winner = card.team;
    //       }
    //     } else if (card.team === CardTeam.ASSASSIN) {
    //       state.winner = getOppositeTeam(state.turn.team);
    //     }
    //
    //     if (state.turn.guessesLeft === 0) {
    //       state.turn.team = getOppositeTeam(state.turn.team);
    //       state.turn.role = Role.SPYMASTER;
    //     }
    //   }
    // },
    // endTurn: (state) => {
    //   if (state.turn.role === Role.OPERATIVE && isPlayerTurn(state) && state.turn.guessesLeft < state.turn.hintNumber) {
    //     state.turn.team = getOppositeTeam(state.turn.team);
    //     state.turn.role = Role.SPYMASTER;
    //   }
    // }
  },
});

export const {setPlayer, setGame, addPlayer, addPlayerToTeam, addClue, removePlayer, setScore, setTurn, revealCard, setCards} = gameSlice.actions;

export const selectPlayerTeam = (state: RootState) => getPlayerTeam(state.root);
export const selectPlayerRole = (state: RootState) => getPlayerRole(state.root);
export const selectIsPlayerTurn = (state: RootState) => isPlayerTurn(state.root);

export default gameSlice.reducer;
