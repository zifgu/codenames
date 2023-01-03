import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  CardData,
  CardTeam,
  Clue,
  Role,
  Team,
} from "./types/types";
import {
  addClue,
  addPlayer,
  addPlayerToTeam,
  removePlayer,
  revealCard,
  selectIsPlayerTurn,
  selectPlayerRole,
  selectPlayerTeam, setCards, setGame, setPlayer,
  setScore,
  setTurn, setWinner,
} from "./slices/gameSlice";
import io, {Socket} from 'socket.io-client';
import {ClientToServerEvents, ServerToClientEvents} from "./types/events";
import {useAppDispatch, useAppSelector} from "./redux/hooks";

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
  const gameState = useAppSelector(state => state.root.game);
  console.log("in Game");
  console.log(gameState);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);
  const playerRole = useAppSelector(selectPlayerRole);

  if (gameState === null) return null;

  return (
    <div className="game">
      <GameWonModal />
      <Header turn={gameState.turn} />
      <Container fluid className="h-75">
        <Row className="h-100">
          <Col xs={2}>
            <TeamPanel team={CardTeam.RED} />
          </Col>
          <Col xs={8}>
            <CardGrid cards={gameState.cards} />
          </Col>
          <Col xs={2}>
            <TeamPanel team={CardTeam.BLUE} />
          </Col>
        </Row>
      </Container>
      {
        isPlayerTurn && (
          playerRole === Role.SPYMASTER ?
          <SpymasterInput /> :
          <OperativeInput />
        )
      }
    </div>
  );
}

function GameWonModal() {
  const winner = useAppSelector(state => state.root.winner);

  return (
    <Modal
      show={winner != null}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        {
          winner != null &&
          <Modal.Title>
            Winner: {winner}!
          </Modal.Title>
        }
      </Modal.Header>
      <Modal.Footer>
        <Button variant="secondary">
          End game
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Header({turn}: {turn: {team: Team, role: Role}}) {
  const playerId = useAppSelector(state => state.root.playerId);
  const playerTeam = useAppSelector(selectPlayerTeam);
  const playerRole = useAppSelector(selectPlayerRole);
  const message = (playerTeam && playerRole) ?
    `You are the ${playerTeam} ${playerRole}.` :
    "You are not in a team.";

  return (
    <div>
      You are {playerId}.
      {" "}
      {message}
      {" "}
      It is the {turn.team} {turn.role}'s turn.
    </div>
  );
}

function SpymasterInput() {
  const [word, setWord] = useState<string>("");
  const [number, setNumber] = useState<number>(1);
  const playerTeam = useAppSelector(selectPlayerTeam);

  if (!playerTeam) return null;

  const validWord = (w: string) => w.length > 0;
  const validNumber = (num: number) => 1 <= num && num <= 9;
  const onChangeWord = (e: any) => setWord(e.target.value);
  const onChangeNumber = (e: any) => {
    const value = parseInt(e.target.value);
    if (validNumber(value)) {
      setNumber(value);
    }
  }
  const onSubmitClue = () => {
    socket.emit("submitClue", {word, number, team: playerTeam});
    setWord("");
    setNumber(1);
  }

  return (
    <Row className="justify-content-center">
      <Col xs={3}>
        <Form.Control
          type="text"
          placeholder="Clue"
          value={word}
          onChange={onChangeWord}
        />
      </Col>
      <Col xs={3}>
        <Form.Control
          type="number"
          min="1"
          max="9"
          placeholder="Number"
          value={number}
          onChange={onChangeNumber}
        />
      </Col>
      <Col xs={1}>
        <Button
          disabled={!validWord(word) || !validNumber(number)}
          onClick={onSubmitClue}
        >
          Go
        </Button>
      </Col>
    </Row>
  );
}

function OperativeInput() {
  const canEndTurn = useAppSelector(state => state.root.game && state.root.game.turn.guessesLeft < state.root.game.turn.maxGuesses);

  return (
    <Button
      disabled={!canEndTurn}
      onClick={() => {
        socket.emit("endTurn")
      }}
    >
      End turn
    </Button>
  );
}

function TeamPanel({team}: {team: Team}) {
  const gameState = useAppSelector(state => state.root.game);

  if (gameState === null) return null;

  return (
    <div className="h-100 d-flex flex-column gap-2">
      {team}
      <ScorePanel
        score={gameState.score[team]}
        targetScore={gameState.targetScore[team]}
      />
      <PlayersPanel team={team}/>
      <HistoryPanel
        pastClues={gameState.pastClues.filter((clue) => clue.team === team)}
      />
    </div>
  );
}

function ScorePanel({score, targetScore} : {score: number, targetScore: number}) {
  return (
    <div className="border">Score: {score} / {targetScore}</div>
  );
}

function PlayersPanel({team} : {team: Team}) {
  const gameState = useAppSelector(state => state.root.game);
  const playerTeam = useAppSelector(selectPlayerTeam);
  const dispatch = useAppDispatch();

  if (gameState === null) return null;

  const spymasterId = gameState.teams[team][Role.SPYMASTER];
  const spymaster = spymasterId ? gameState.players[spymasterId] : null;
  const operatives = gameState.teams[team][Role.OPERATIVE].map((id) => gameState.players[id]);

  return (
    <div className="border">
      Spymasters:
      <div>
        {
          spymaster &&
          <div key={spymaster.id}>{spymaster.id}</div>
        }
      </div>
      <Button
        disabled={playerTeam !== null || spymaster !== null}
        onClick={() => {
          socket.emit("joinTeam", team, Role.SPYMASTER, (cards) => {
            if (cards !== undefined) {
              dispatch(setCards(cards));
            }
          });
        }}
      >
        Join as spymaster
      </Button>
      Operatives:
      <div>
        {
          operatives.map((playerData) => (
            <div key={playerData.id}>{playerData.id}</div>
          ))
        }
      </div>
      <Button
        disabled={playerTeam !== null}
        onClick={() => {
          socket.emit("joinTeam", team, Role.OPERATIVE, () => {});
        }}
      >
        Join as operative
      </Button>
    </div>
  );
}

function HistoryPanel({pastClues} : {pastClues: Clue[]}) {
  return (
    <div className="flex-grow-1 border">
      {
        pastClues.map((clue) => (
          <div key={clue.word}>{clue.word} ({clue.number})</div>
        ))
      }
    </div>
  );
}

function CardGrid({cards}: {cards: CardData[]}) {
  return (
    <div className="h-100 gap-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gridTemplateRows: "1fr 1fr 1fr 1fr 1fr"}}>
      {
        cards.map((card, index) => (
          <Card key={card.codename} index={index} cardData={card}/>
        ))
      }
    </div>
  );
}

function Card({index, cardData}: {index: number, cardData: CardData}) {
  const playerRole = useAppSelector(selectPlayerRole);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);

  const cardClass = cardData.team; // same string representation as team
  const revealedClass = (playerRole === Role.SPYMASTER && cardData.revealed) ? "revealed" : "";

  return (
    <div className={`d-flex flex-column justify-content-center codename-card ${cardClass} ${revealedClass}`}>
      {cardData.codename.toUpperCase()}
      {
        isPlayerTurn && playerRole === Role.OPERATIVE && !cardData.revealed &&
          <Button
            size="sm"
            variant="light"
            onClick={() => {
              socket.emit("submitGuess", index);
            }}
          >
            Guess
          </Button>
      }
    </div>
  );
}

export default App;
