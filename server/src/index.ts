import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./types/events";
import {CardTeam, GameState, Role} from "./types/types";
import {
  addPlayer,
  addPlayerToTeam,
  createRoom,
  endTurn,
  getCards,
  getGame, getScore, getTurn, getWinner,
  removePlayer,
  submitClue,
  submitGuess
} from "./rooms";

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

// TODO: delete stale rooms somehow

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

  socket.on("createGame", (playerId, callback) => {
    const roomId = createRoom();
    addPlayer(roomId, playerId);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = playerId;

    callback(roomId, filterGame(getGame(roomId)));
  });

  socket.on("joinGame", (playerId, roomId, callback) => {
    const result = addPlayer(roomId, playerId);

    if (!("error" in result)) {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.playerId = playerId;

      callback(roomId, filterGame(getGame(roomId)));
      socket.to(roomId).emit("playerJoin", result);
    } else if (result.error === "noSuchRoom") {
      callback(null, null);
    } else {
      callback(roomId, null);
    }
  });

  // TODO: to all sockets except sender

  socket.on("joinTeam", (team, role, callback) => {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    if (addPlayerToTeam(roomId, playerId, team, role)) {
      if (role === Role.SPYMASTER) {
        callback(getCards(roomId));
      } else {
        callback();
      }
      io.in(roomId).emit("playerJoinTeam", playerId, team, role);
    }
  });

  socket.on("submitClue", (clue) => {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    if (submitClue(roomId, playerId, clue)) {
      io.in(roomId).emit("newClue", playerId, clue, getTurn(roomId));
    }
  });

  socket.on("submitGuess", (cardIndex) => {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    const revealedTeam = submitGuess(roomId, playerId, cardIndex);
    if (revealedTeam) {
      io.in(roomId).emit("newGuess", playerId, cardIndex, revealedTeam, getScore(roomId), getTurn(roomId));

      const winner = getWinner(roomId);
      if (winner) {
        io.in(roomId).emit("win", winner);
      }
    }
  });

  socket.on("endTurn", () => {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    if (endTurn(roomId, playerId)) {
      io.in(roomId).emit("newTurn", getTurn(roomId));
    }
  });

  socket.on("leaveGame", () => {
    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    if (removePlayer(roomId, playerId)) {
      // Clear room ID and player ID in case client wants to join another room
      socket.leave(roomId);
      socket.data.playerId = "";
      socket.data.roomId = "";

      io.in(roomId).emit("playerLeave", playerId);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");

    const playerId = socket.data.playerId;
    const roomId = socket.data.roomId;
    if (!playerId || !roomId) return;

    if (removePlayer(roomId, playerId)) {
      io.in(roomId).emit("playerLeave", playerId);
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});