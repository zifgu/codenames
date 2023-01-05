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
  oppositeTeam
} from "./types/types";
import {getRandomCards} from "./generation";
import {nanoid} from "nanoid";

const rooms: { [id: RoomId]: Room } = {};

const newGame = (startingTeam: Team): GameState => {
  return {
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
    cards: getRandomCards(startingTeam),
    turn: {
      maxGuesses: 0,
      guessesLeft: 0,
      role: Role.SPYMASTER,
      team: startingTeam,
    },
    pastClues: [],
    score: {
      [CardTeam.RED]: 0,
      [CardTeam.BLUE]: 0,
    },
    targetScore: {
      [CardTeam.RED]: startingTeam === CardTeam.RED ? 9 : 8,
      [CardTeam.BLUE]: startingTeam === CardTeam.BLUE ? 9 : 8,
    },
    winner: null,
  };
};

/*
  Getters - assume the objects exist
*/
export const getPlayers = (roomId: RoomId) => rooms[roomId].players;
export const getGame = (roomId: RoomId) => rooms[roomId].game;
export const getCards = (roomId: RoomId) => rooms[roomId].game.cards;
export const getTurn = (roomId: RoomId) => rooms[roomId].game.turn;
export const getScore = (roomId: RoomId) => rooms[roomId].game.score;
export const getWinner = (roomId: RoomId) => rooms[roomId].game.winner;

const roomAndPlayerExist = (roomId: RoomId, playerId: PlayerId): boolean => {
  return roomId in rooms && playerId in rooms[roomId].players;
}

/*
  Public functions
*/
export const createRoom = (startingTeam: Team): RoomId => {
  const roomId = nanoid();
  const game = newGame(startingTeam);
  rooms[roomId] = {id: roomId, game, players: {}};

  console.log(`Created room ${roomId}`);
  return roomId;
}

export const resetRoom = (roomId: RoomId, startingTeam: Team): boolean => {
  if (!(roomId in rooms)) {
    return false;
  }

  // Clear player roles, since they exist outside the game object
  const room = rooms[roomId];
  for (let player of Object.values(room.players)) {
    player.team = null;
    player.role = null;
  }

  rooms[roomId].game = newGame(startingTeam);

  console.log(`The game in room ${roomId} was reset`);
  console.log(room);
  return true;
}

export const addPlayer = (roomId: RoomId, playerId: PlayerId): PlayerData | { error: "noSuchRoom" | "nicknameInUse" } => {
  if (!(roomId in rooms)) {
    return {error: "noSuchRoom"};
  }

  const room = rooms[roomId];

  if (playerId in room.players) {
    console.log(`Error: nickname ${playerId} in use`);
    return {error: "nicknameInUse"};
  } else {
    const playerData: PlayerData = {id: playerId, team: null, role: null};
    room.players[playerId] = playerData;

    console.log(`Player ${playerId} joined room ${roomId}`);
    console.log(room);
    return playerData;
  }
}

export const removePlayer = (roomId: RoomId, playerId: PlayerId): boolean => {
  if (roomId in rooms) {
    const room = rooms[roomId];
    const game = room.game;

    if (game.teams[CardTeam.RED][Role.SPYMASTER] === playerId) {
      game.teams[CardTeam.RED][Role.SPYMASTER] = null;
    } else if (game.teams[CardTeam.BLUE][Role.SPYMASTER] === playerId) {
      game.teams[CardTeam.BLUE][Role.SPYMASTER] = null;
    } else {
      game.teams[CardTeam.RED][Role.OPERATIVE] = game.teams[CardTeam.RED][Role.OPERATIVE].filter((id) => id !== playerId);
      game.teams[CardTeam.BLUE][Role.OPERATIVE] = game.teams[CardTeam.BLUE][Role.OPERATIVE].filter((id) => id !== playerId);
    }

    delete room.players[playerId];

    console.log(`Player ${playerId} left room ${roomId}`);
    console.log(room);
    return true;
  }
  return false;
}

export const addPlayerToTeam = (roomId: RoomId, playerId: PlayerId, team: Team, role: Role): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const room = rooms[roomId];
  const game = room.game;

  if (room.players[playerId].team || room.players[playerId].role) {
    // Already has team/role
    return false;
  }

  room.players[playerId].team = team;
  room.players[playerId].role = role;
  if (role === Role.SPYMASTER) {
    game.teams[team][role] = playerId;
  } else {
    game.teams[team][role].push(playerId);
  }

  console.log(`Player ${playerId} joined team ${team} as a ${role}`);
  console.log(room);
  return true;
}

export const submitClue = (roomId: RoomId, playerId: PlayerId, clue: Clue): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const room = rooms[roomId];
  const game = room.game;
  const playerTeam = room.players[playerId].team;
  const playerRole = room.players[playerId].role;

  if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.SPYMASTER) {
    game.pastClues.push(clue);

    game.turn.maxGuesses = clue.number + 1;
    game.turn.guessesLeft = game.turn.maxGuesses;
    game.turn.role = Role.OPERATIVE;

    console.log(`Player ${playerId} gave clue ${clue.word} (${clue.number})`);
    console.log(room);
    return true;
  }
  return false;
}

export const submitGuess = (roomId: RoomId, playerId: PlayerId, cardIndex: number): CardTeam | null => {
  if (cardIndex < 0 || cardIndex >= 25) return null;
  if (!roomAndPlayerExist(roomId, playerId)) return null;

  const room = rooms[roomId];
  const game = room.game;
  const playerTeam = room.players[playerId].team;
  const playerRole = room.players[playerId].role;
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
      game.winner = oppositeTeam[playerTeam];
    }

    if (game.turn.guessesLeft === 0) {
      game.turn.team = oppositeTeam[game.turn.team];
      game.turn.role = Role.SPYMASTER;
    }

    console.log(`Player ${playerId} guessed card ${cardIndex} '${card.codename}' which was ${card.team}`);
    console.log(room);
    return card.team;
  }
  return null;
}

export const endTurn = (roomId: RoomId, playerId: PlayerId): boolean => {
  if (!roomAndPlayerExist(roomId, playerId)) return false;

  const room = rooms[roomId];
  const game = room.game;
  const playerTeam = room.players[playerId].team;
  const playerRole = room.players[playerId].role;

  if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.OPERATIVE && game.turn.guessesLeft < game.turn.maxGuesses) {
    game.turn.team = oppositeTeam[game.turn.team];
    game.turn.role = Role.SPYMASTER;

    console.log(`Player ${playerId} ended their turn`);
    console.log(room);
    return true;
  }
  return false;
}