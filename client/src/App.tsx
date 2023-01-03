import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import {CardTeam, Clue, Role, Team,} from "./types/types";
import {
  addClue,
  addPlayer,
  addPlayerToTeam,
  removePlayer,
  revealCard,
  selectIsPlayerTurn,
  selectPlayerRole, setCards,
  setGame,
  setPlayer,
  setScore,
  setTurn,
  setWinner,
} from "./slices/gameSlice";
import io, {Socket} from 'socket.io-client';
import {ClientToServerEvents, ServerToClientEvents} from "./types/events";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {GameWonModal} from "./components/WinModal";
import {Header, OperativeInput, SpymasterInput} from "./components/Header";
import {TeamPanel} from "./components/TeamPanel";
import {CardGrid} from "./components/CardGrid";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://localhost:3001`);

export function App() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.root.game);
  const [nickname, setNickname] = useState<string>("");

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

    socket.on("win", (winningTeam) => {
      console.log(`Received win`);
      dispatch(setWinner(winningTeam));
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

  const onConnect = () => {
    socket.emit("join", nickname, (gameState) => {
      dispatch(addPlayer({id: nickname, team: null, role: null}));
      dispatch(setPlayer(nickname));
      dispatch(setGame(gameState));
    });
  }

  return (
    <>
      {
        gameState ?
          <Game/> :
          <JoinPage
            nickname={nickname}
            onChangeNickname={(newNickname) => setNickname(newNickname)}
            onConnect={onConnect}
          />
      }
    </>
  );
}

function JoinPage({nickname, onChangeNickname, onConnect}: {nickname: string, onChangeNickname: (nickname: string) => void, onConnect: () => void}) {
  return (
    <div className="game">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Form.Control
            type="text"
            placeholder="Enter a nickname"
            value={nickname}
            onChange={(e) => onChangeNickname(e.target.value)}
          />
        </Col>
        <Col xs={2}>
          <Button onClick={onConnect}>
            Connect
          </Button>
        </Col>
      </Row>
    </div>
  );
}

function Game() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.root.game);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);
  const playerRole = useAppSelector(selectPlayerRole);

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

  return (
    <div className="game">
      <GameWonModal />
      <Header turn={gameState.turn} />
      <Container fluid className="h-75">
        <Row className="h-100">
          <Col xs={2}>
            <TeamPanel
              team={CardTeam.RED}
              onJoinTeam={handleJoinTeam}
            />
          </Col>
          <Col xs={8}>
            <CardGrid
              cards={gameState.cards}
              onSubmitGuess={handleSubmitGuess}
            />
          </Col>
          <Col xs={2}>
            <TeamPanel
              team={CardTeam.BLUE}
              onJoinTeam={handleJoinTeam}
            />
          </Col>
        </Row>
      </Container>
      {
        isPlayerTurn && (
          playerRole === Role.SPYMASTER ?
          <SpymasterInput onSubmitClue={handleSubmitClue}/> :
          <OperativeInput onEndTurn={handleEndTurn}/>
        )
      }
    </div>
  );
}

export default App;
