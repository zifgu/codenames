import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {useAppSelector} from "../redux/hooks";
import {Clue, Role, Team} from "../types/types";
import {selectPlayerRole, selectPlayerTeam} from "../slices/gameSlice";

export function Header({turn}: { turn: { team: Team, role: Role } }) {
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

export function SpymasterInput({onSubmitClue}: {onSubmitClue: (clue: Clue) => void}) {
  const [word, setWord] = useState<string>("");
  const [number, setNumber] = useState<number>(1);
  const playerTeam = useAppSelector(selectPlayerTeam);

  if (!playerTeam) return null;

  const validWord = (w: string) => w.length > 0;
  const validNumber = (num: number) => 1 <= num && num <= 9;
  const handleChangeWord = (e: any) => setWord(e.target.value);
  const handleChangeNumber = (e: any) => {
    const value = parseInt(e.target.value);
    if (validNumber(value)) {
      setNumber(value);
    }
  }
  const handleSubmitClue = () => {
    onSubmitClue({word, number, team: playerTeam});
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
          onChange={handleChangeWord}
        />
      </Col>
      <Col xs={3}>
        <Form.Control
          type="number"
          min="1"
          max="9"
          placeholder="Number"
          value={number}
          onChange={handleChangeNumber}
        />
      </Col>
      <Col xs={1}>
        <Button
          disabled={!validWord(word) || !validNumber(number)}
          onClick={handleSubmitClue}
        >
          Go
        </Button>
      </Col>
    </Row>
  );
}

export function OperativeInput({onEndTurn}: {onEndTurn: () => void}) {
  const canEndTurn = useAppSelector(state => state.root.game && state.root.game.turn.guessesLeft < state.root.game.turn.maxGuesses);

  return (
    <Button
      disabled={!canEndTurn}
      onClick={onEndTurn}
    >
      End turn
    </Button>
  );
}