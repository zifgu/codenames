import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./types/events";
import {
  CardTeam,
  GameState,
  getOppositeTeam,
  PlayerData,
  Role,
  roleToString,
  teamToString
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
    hintNumber: 0,
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
};

const filterGame = (gameState: GameState) => {
  const copy = {...gameState};
  copy.cards = copy.cards.map((card) => {
    if (card.revealed) {
      return card;
    } else {
      return {...card, team: CardTeam.UNKNOWN};
    }
  });
  return copy;
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerId, callback) => {
    console.log("Received join event");
    socket.data.id = playerId;  // TODO: is this synced with the client?

    if (playerId in game.players) {
      console.log(`Error: nickname ${playerId} in use`);

      callback(null);
    } else {
      const playerData: PlayerData = {id: playerId};
      game.players[playerId] = playerData;

      console.log(`Player ${playerId} joined`);
      console.log(game);
      callback(filterGame(game));

      socket.broadcast.emit("playerJoin", playerData);
    }
  });

  socket.on("joinTeam", (playerId, team, role, callback) => {
    // TODO: validation

    game.players[playerId].team = team;
    game.players[playerId].role = role;

    if (role === Role.SPYMASTER) {
      game.teams[team][role] = playerId;
    } else {
      game.teams[team][role].push(playerId);
    }

    console.log(`Player ${playerId} joined team ${teamToString(team)} as a ${roleToString(role)}`);
    console.log(game);

    if (callback) {
      callback(game.cards);
    }

    // TODO: to all sockets except sender later
    io.emit("playerJoinTeam", playerId, team, role);
  });

  socket.on("submitClue", (playerId, clue) => {
    // TODO: validation

    game.pastClues.push(clue);

    game.turn.hintNumber = clue.number + 1;
    game.turn.guessesLeft = game.turn.hintNumber;
    game.turn.role = Role.OPERATIVE;

    console.log(`Player ${playerId} gave clue ${clue.word} (${clue.number})`);
    console.log(game);

    io.emit("newClue", playerId, clue, game.turn);
  });

  socket.on("submitGuess", (playerId, cardIndex) => {
    // TODO: validation
    const playerTeam = game.players[playerId].team;
    const card = game.cards[cardIndex];

    if (!card.revealed) {
      card.revealed = true;

      if (card.team === playerTeam) {
        game.turn.guessesLeft -= 1;
      } else {
        game.turn.guessesLeft = 0;
      }

      if (card.team === CardTeam.RED || card.team === CardTeam.BLUE) {
        game.score[card.team]++;

        if (game.score[card.team] >= game.targetScore[card.team]) {
          // TODO: win
        }
      } else if (card.team === CardTeam.ASSASSIN) {
        // TODO: win
      }

      if (game.turn.guessesLeft === 0) {
        game.turn.team = getOppositeTeam(game.turn.team);
        game.turn.role = Role.SPYMASTER;
      }

      console.log(`Player ${playerId} guessed card ${cardIndex} '${card.codename}' which was ${teamToString(card.team)}`);
      console.log(game);

      io.emit("newGuess", playerId, cardIndex, card.team, game.score, game.turn);
    }
  });

  socket.on("endTurn", (playerId) => {
    // TODO: validation

    game.turn.team = getOppositeTeam(game.turn.team);
    game.turn.role = Role.SPYMASTER;

    console.log(`Player ${playerId} ended their turn`);
    console.log(game);

    io.emit("newTurn", game.turn);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    const nickname = socket.data.id;

    if (nickname) {
      // TODO: smarter deletion?
      if (game.teams[CardTeam.RED][Role.SPYMASTER] === nickname) {
        game.teams[CardTeam.RED][Role.SPYMASTER] = null;
      } else if (game.teams[CardTeam.BLUE][Role.SPYMASTER] === nickname) {
        game.teams[CardTeam.BLUE][Role.SPYMASTER] = null;
      } else {
        game.teams[CardTeam.RED][Role.OPERATIVE] = game.teams[CardTeam.RED][Role.OPERATIVE].filter((id) => id !== nickname);
        game.teams[CardTeam.BLUE][Role.OPERATIVE] = game.teams[CardTeam.BLUE][Role.OPERATIVE].filter((id) => id !== nickname);
      }

      delete game.players[nickname];

      console.log(`Player ${nickname} left`);
      console.log(game);

      io.emit("playerLeave", nickname);
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});