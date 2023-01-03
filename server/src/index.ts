import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./types/events";
import {
  CardTeam,
  GameState,
  getOppositeTeam,
  PlayerData,
  Role, Team,
} from "./types/types";
import {getRandomCards} from "./generation";

const app = express();
const server = http.createServer(app);

// TODO: fix CORS-related issues
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
  },
});

const port = 3001;

const game: GameState = {
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
    [CardTeam.RED]: 3,
    [CardTeam.BLUE]: 3,
  },
};

const filterGame = (gameState: GameState) => {
  const copy = {...gameState};
  copy.cards = copy.cards.map((card) => {
    if (card.revealed) {
      return card;
    } else {
      return {...card, team: CardTeam.HIDDEN};
    }
  });
  return copy;
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerId, callback) => {
    if (playerId in game.players) {
      console.log(`Error: nickname ${playerId} in use`);

      callback(null);
    } else {
      socket.data.id = playerId;

      const playerData: PlayerData = {id: playerId, team: null, role: null};
      game.players[playerId] = playerData;

      console.log(`Player ${playerId} joined`);
      console.log(game);

      callback(filterGame(game));

      socket.broadcast.emit("playerJoin", playerData);
    }
  });

  // TODO: to all sockets except sender

  socket.on("joinTeam", (team, role, callback) => {
    // Do nothing if player already has a team/role
    const playerId = socket.data.id;

    if (playerId && !game.players[playerId].team && !game.players[playerId].role) {
      game.players[playerId].team = team;
      game.players[playerId].role = role;

      if (role === Role.SPYMASTER) {
        game.teams[team][role] = playerId;
        callback(game.cards);
      } else {
        game.teams[team][role].push(playerId);
        callback();
      }

      console.log(`Player ${playerId} joined team ${team} as a ${role}`);
      console.log(game);

      io.emit("playerJoinTeam", playerId, team, role);
    }
  });

  socket.on("submitClue", (clue) => {
    const playerId = socket.data.id;
    if (!playerId) return;

    // Do nothing if player is not allowed to submit clues
    const playerTeam = game.players[playerId].team;
    const playerRole = game.players[playerId].role;

    if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.SPYMASTER) {
      game.pastClues.push(clue);

      game.turn.maxGuesses = clue.number + 1;
      game.turn.guessesLeft = game.turn.maxGuesses;
      game.turn.role = Role.OPERATIVE;

      console.log(`Player ${playerId} gave clue ${clue.word} (${clue.number})`);
      console.log(game);

      io.emit("newClue", playerId, clue, game.turn);
    }
  });

  socket.on("submitGuess", (cardIndex) => {
    const playerId = socket.data.id;
    if (!playerId) return;

    // Do nothing if player is not allowed to submit guesses
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

      let winner: null | Team = null;
      if (card.team === CardTeam.RED || card.team === CardTeam.BLUE) {
        game.score[card.team]++;

        if (game.score[card.team] >= game.targetScore[card.team]) {
          winner = card.team;
        }
      } else if (card.team === CardTeam.ASSASSIN) {
        winner = getOppositeTeam(playerTeam);
      }

      if (game.turn.guessesLeft === 0) {
        game.turn.team = getOppositeTeam(game.turn.team);
        game.turn.role = Role.SPYMASTER;
      }

      console.log(`Player ${playerId} guessed card ${cardIndex} '${card.codename}' which was ${card.team}`);
      console.log(game);

      io.emit("newGuess", playerId, cardIndex, card.team, game.score, game.turn);

      if (winner) {
        io.emit("win", winner);
      }
    }
  });

  socket.on("endTurn", () => {
    const playerId = socket.data.id;
    if (!playerId) return;

    // Do nothing if player is not allowed to end turn
    const playerTeam = game.players[playerId].team;
    const playerRole = game.players[playerId].role;

    if (playerTeam == game.turn.team && playerRole === game.turn.role && playerRole === Role.OPERATIVE && game.turn.guessesLeft < game.turn.maxGuesses) {
      game.turn.team = getOppositeTeam(game.turn.team);
      game.turn.role = Role.SPYMASTER;

      console.log(`Player ${playerId} ended their turn`);
      console.log(game);

      io.emit("newTurn", game.turn);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    const playerId = socket.data.id;

    if (playerId) {
      if (game.teams[CardTeam.RED][Role.SPYMASTER] === playerId) {
        game.teams[CardTeam.RED][Role.SPYMASTER] = null;
      } else if (game.teams[CardTeam.BLUE][Role.SPYMASTER] === playerId) {
        game.teams[CardTeam.BLUE][Role.SPYMASTER] = null;
      } else {
        game.teams[CardTeam.RED][Role.OPERATIVE] = game.teams[CardTeam.RED][Role.OPERATIVE].filter((id) => id !== playerId);
        game.teams[CardTeam.BLUE][Role.OPERATIVE] = game.teams[CardTeam.BLUE][Role.OPERATIVE].filter((id) => id !== playerId);
      }

      delete game.players[playerId];

      console.log(`Player ${playerId} left`);
      console.log(game);

      io.emit("playerLeave", playerId);
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});