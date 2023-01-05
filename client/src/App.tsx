import React, {useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {CardTeam, Clue, PlayerId, Role, RoomId, Team,} from "./types/types";
import {
  reset,
  addClue,
  addPlayer,
  addPlayerToTeam,
  removePlayer,
  revealCard,
  setCards,
  setGame,
  setPlayer,
  setRoomId,
  setScore,
  setTurn,
  setWinner, selectGame,
} from "./slices/gameSlice";
import io, {Socket} from 'socket.io-client';
import {ClientToServerEvents, ServerToClientEvents} from "./types/events";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {GameWonModal} from "./components/WinModal";
import {Header} from "./components/Header";
import {TeamPanel} from "./components/TeamPanel";
import {CardGrid} from "./components/CardGrid";
import {GameMenu} from "./components/GameMenu";
import {HomePage} from "./components/HomePage";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://localhost:3001`);

export function App() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(selectGame);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("playerJoin", (player) => {
      console.log(`Received playerJoin ${player.id}`);
      dispatch(addPlayer(player));
    });

    socket.on("playerJoinTeam", (playerId, team, role) => {
      console.log(`Received playerJoinTeam ${playerId} ${team} ${role}`);
      dispatch(addPlayerToTeam({playerId, team, role}));
    });

    socket.on("playerLeave", (playerId) => {
      console.log(`Received playerLeave ${playerId}`);
      dispatch(removePlayer(playerId));
    });

    socket.on("newClue", (playerId, clue, newTurn) => {
      console.log(`Received clue from ${playerId}: ${clue.word} (${clue.number})`);
      dispatch(addClue(clue));
      dispatch(setTurn(newTurn));
    });

    socket.on("newGuess", (playerId, cardIndex, colour, newScore, newTurn) => {
      console.log(`Received guess from ${playerId}: card ${cardIndex} is ${colour}`);
      dispatch(revealCard({cardIndex, colour}));
      dispatch(setScore(newScore));
      dispatch(setTurn(newTurn));
    });

    socket.on("newTurn", (newTurn) => {
      console.log(`Received endTurn`);
      dispatch(setTurn(newTurn));
    });

    socket.on("win", (winningTeam, cards) => {
      console.log(`Received win`);
      dispatch(setWinner(winningTeam));
      dispatch(setCards(cards));
    });

    return () => {
      socket.off("connect");

      socket.off("playerJoin");
      socket.off("playerJoinTeam");
      socket.off("playerLeave");
      socket.off("newClue");
      socket.off("newGuess");
      socket.off("newTurn");
      socket.off("win");
    };
  }, [dispatch]);

  const handleCreateGame = (nickname: PlayerId) => {
    socket.emit("createGame", nickname, (roomId, gameState) => {
      dispatch(addPlayer({id: nickname, team: null, role: null}));
      dispatch(setRoomId(roomId));
      dispatch(setPlayer(nickname));
      dispatch(setGame(gameState));
    });
  };

  const handleJoinGame = (room: RoomId, nickname: PlayerId) => {
    return new Promise<{roomError: boolean, nicknameError: boolean}>((resolve) => {
      socket.emit("joinGame", nickname, room, (roomId, gameState) => {
        if (roomId === null) {
          // Invalid room ID
          resolve({roomError: true, nicknameError: false});
        } else if (gameState === null) {
          // Invalid nickname
          resolve({roomError: false, nicknameError: true});
        } else {
          dispatch(addPlayer({id: nickname, team: null, role: null}));
          dispatch(setRoomId(roomId));
          dispatch(setPlayer(nickname));
          dispatch(setGame(gameState));
          resolve({roomError: false, nicknameError: false});
        }
      });
    });
  };

  return (
    <>
      {
        gameState ?
          <Game/> :
          <HomePage
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
          />
      }
    </>
  );
}

function Game() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(selectGame);

  if (gameState === null) return null;

  const handleJoinTeam = (team: Team, role: Role) => {
    socket.emit("joinTeam", team, role, (cards) => {
      if (cards !== undefined) {
        dispatch(setCards(cards));
      }
    });
  };

  const handleSubmitGuess = (cardIndex: number) => {
    socket.emit("submitGuess", cardIndex);
  };

  const handleSubmitClue = (clue: Clue) => {
    socket.emit("submitClue", clue);
  };

  const handleEndTurn = () => {
    socket.emit("endTurn");
  };

  const handleLeaveGame = () => {
    socket.emit("leaveGame");
    dispatch(reset());
  }

  return (
    <div className="game">
      <GameWonModal />
      <GameMenu onLeaveGame={handleLeaveGame} />
      <Header
        turn={gameState.turn}
        onSubmitClue={handleSubmitClue}
        onEndTurn={handleEndTurn}
      />
      <Container fluid className="game-main">
        <Row className="h-100">
          <Col xs={2} className="h-100">
            <TeamPanel
              team={CardTeam.RED}
              onJoinTeam={handleJoinTeam}
            />
          </Col>
          <Col xs={8} className="h-100">
            <CardGrid
              cards={gameState.cards}
              onSubmitGuess={handleSubmitGuess}
            />
          </Col>
          <Col xs={2} className="h-100">
            <TeamPanel
              team={CardTeam.BLUE}
              onJoinTeam={handleJoinTeam}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
