import {
  CardTeam,
  GameState,
  Role,
  Room,
  RoomId,
  PlayerId,
  Team,
  PlayerData,
  Clue,
  getOppositeTeam
} from "./types/types";
import {getRandomCards} from "./generation";
import {nanoid} from "nanoid";

const rooms: {[id: RoomId]: Room} = {};

const newGame = (): GameState => ({
  players: {},
  teams: {
    [CardTeam.RED]: {
      [Role.SPYMASTER]: null,
      [Role.OPERATIVE]: []
    },
    [CardTeam.BLUE]: {
      [Role.SPYMASTER]: null,
      [Role.OPERATIVE]: []
    }
  },

  cards: getRandomCards(),
  turn: {
    maxGuesses: 0,
    guessesLeft: 0,
    role: Role.SPYMASTER,
    team: CardTeam.RED,
  },
  pastClues: [],
  score: {
    [CardTeam.RED]: 0,
    [CardTeam.BLUE]: 0,
  },
  targetScore: {
    [CardTeam.RED]: 9,
    [CardTeam.BLUE]: 8,
  },
  winner: null,
});

// Getters - assume the objects exist
export const getGame = (roomId: RoomId) => rooms[roomId].game;
export const getCards = (roomId: RoomId) => rooms[roomId].game.cards;
export const getTurn = (roomId: RoomId) => rooms[roomId].game.turn;
export const getScore = (roomId: RoomId) => rooms[roomId].game.score;
export const getWinner = (roomId: RoomId) => rooms[roomId].game.winner;

export const createRoom = (): RoomId => {
  const roomId = nanoid();
  const game = newGame();
  rooms[roomId] = {id: roomId, game};

  console.log(`Created room ${roomId}`);
  return roomId;
}

export const addPlayer = (roomId: RoomId, playerId: PlayerId): PlayerData | {error: "noSuchRoom" | "nicknameInUse"} => {
  if (!(roomId in rooms)) {
    return { error: "noSuchRoom" };
  }

  const game = rooms[roomId].game;

  if (playerId in game.players) {
    console.log(`Error: nickname ${playerId} in use`);
    return { error: "nicknameInUse" };
  } else {
    const playerData: PlayerData = {id: playerId, team: null, role: null};
    game.players[playerId] = playerData;

    console.log(`Player ${playerId} joined room ${roomId}`);
    console.log(game);
    return playerData;
  }
}

export const removePlayer = (roomId: RoomId, playerId: PlayerId): boolean => {
  if (roomId in rooms) {
    const game = rooms[roomId].game;

    if (game.teams[CardTeam.RED][Role.SPYMASTER] === playerId) {
      game.teams[CardTeam.RED][Role.SPYMASTER] = null;
    } else if (game.teams[CardTeam.BLUE][Role.SPYMASTER] === playerId) {
      game.teams[CardTeam.BLUE][Role.SPYMASTER] = null;
    } else {
      game.teams[CardTeam.RED][Role.OPERATIVE] = game.teams[CardTeam.RED][Role.OPERATIVE].filter((id) => id !== playerId);
      game.teams[CardTeam.BLUE][Role.OPERATIVE] = game.teams[CardTeam.BLUE][Role.OPERATIVE].filter((id) => id !== playerId);
    }

    delete game.players[playerId];

    console.log(`Player ${playerId} left room ${roomId}`);
    console.log(game);
    return true;
  }
  return false;
}

const roomAndPlayerExist = (roomId: RoomId, playerId: PlayerId): boolean => {
  return roomId in rooms && playerId in rooms[roomId].game.players;
}

export const addPlayerToTeam = (roomId: RoomId, playerId: PlayerId, team: Team, role: Role): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const game = rooms[roomId].game;

  if (game.players[playerId].team || game.players[playerId].role) {
    // Already has team/role
    return false;
  }

  game.players[playerId].team = team;
  game.players[playerId].role = role;
  if (role === Role.SPYMASTER) {
    game.teams[team][role] = playerId;
  } else {
    game.teams[team][role].push(playerId);
  }

  console.log(`Player ${playerId} joined team ${team} as a ${role}`);
  console.log(game);
  return true;
}

export const submitClue = (roomId: RoomId, playerId: PlayerId, clue: Clue): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const game = rooms[roomId].game;
  const playerTeam = game.players[playerId].team;
  const playerRole = game.players[playerId].role;

  if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.SPYMASTER) {
    game.pastClues.push(clue);

    game.turn.maxGuesses = clue.number + 1;
    game.turn.guessesLeft = game.turn.maxGuesses;
    game.turn.role = Role.OPERATIVE;

    console.log(`Player ${playerId} gave clue ${clue.word} (${clue.number})`);
    console.log(game);
    return true;
  }
  return false;
}

export const submitGuess = (roomId: RoomId, playerId: PlayerId, cardIndex: number): CardTeam | null => {
  if (cardIndex < 0 || cardIndex >= 25) return null;
  if (!roomAndPlayerExist(roomId, playerId)) return null;

  const game = rooms[roomId].game;
  const playerTeam = game.players[playerId].team;
  const playerRole = game.players[playerId].role;
  const card = game.cards[cardIndex];

  if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.OPERATIVE && game.turn.guessesLeft > 0 && !card.revealed) {
    card.revealed = true;

    if (card.team === playerTeam) {
      game.turn.guessesLeft -= 1;
    } else {
      game.turn.guessesLeft = 0;
    }

    if (card.team === CardTeam.RED || card.team === CardTeam.BLUE) {
      game.score[card.team]++;

      if (game.score[card.team] >= game.targetScore[card.team]) {
        game.winner = card.team;
      }
    } else if (card.team === CardTeam.ASSASSIN) {
      game.winner = getOppositeTeam(playerTeam);
    }

    if (game.turn.guessesLeft === 0) {
      game.turn.team = getOppositeTeam(game.turn.team);
      game.turn.role = Role.SPYMASTER;
    }

    console.log(`Player ${playerId} guessed card ${cardIndex} '${card.codename}' which was ${card.team}`);
    console.log(game);
    return card.team;
  }
  return null;
}

export const endTurn = (roomId: RoomId, playerId: PlayerId): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const game = rooms[roomId].game;
  const playerTeam = game.players[playerId].team;
  const playerRole = game.players[playerId].role;

  if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.OPERATIVE && game.turn.guessesLeft < game.turn.maxGuesses) {
    game.turn.team = getOppositeTeam(game.turn.team);
    game.turn.role = Role.SPYMASTER;

    console.log(`Player ${playerId} ended their turn`);
    console.log(game);
    return true;
  }
  return false;
}