import React, {FormEvent, ReactNode, useState} from "react";
import {useAppSelector} from "../redux/hooks";
import {Clue, Role, Team} from "../types/types";
import {
  selectIsPlayerTurn,
  selectLatestClue,
  selectPlayerRole,
  selectPlayerTeam,
  selectWinner
} from "../slices/gameSlice";
import {Button} from "./Button";
import {Input} from "./Input";
import "./Header.css";

interface HeaderProps {
  turn: { team: Team, role: Role },
  onSubmitClue: (clue: Clue) => void,
  onEndTurn: () => void,
}

export function Header({turn, onSubmitClue, onEndTurn}: HeaderProps) {
  const winner = useAppSelector(selectWinner);
  const playerTeam = useAppSelector(selectPlayerTeam);
  const playerRole = useAppSelector(selectPlayerRole);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);

  const roleAction = turn.role === Role.SPYMASTER ? "spymaster is giving a clue" : "operatives are guessing";
  let message: ReactNode;
  let display: ReactNode = null;

  if (winner) {
    message = <>
      The <span className={`text-${winner}`}>{winner}</span> team has won!
    </>;
  } else if (!playerRole || !playerTeam) {
    message = <>
      The <span className={`text-${turn.team}`}>{turn.team}</span> {roleAction}.
      Join a team to start playing!
    </>;

    if (turn.role === Role.OPERATIVE) {
      display = <LatestClue />;
    }
  } else if (isPlayerTurn) {
    message = turn.role === Role.SPYMASTER ?
      "It's your turn! Give your operatives a clue:" :
      "It's your turn! Guess which codenames are on your side:";

    display = turn.role === Role.SPYMASTER ?
      <SpymasterControls onSubmitClue={onSubmitClue}/> :
      <OperativeControls onEndTurn={onEndTurn}/>;
  } else {
    message = turn.team === playerTeam ?
      `Your ${roleAction}...` :
      `The opposing ${roleAction}...`;

    if (turn.role === Role.OPERATIVE) {
      display = <LatestClue />;
    }
  }

  return (
    <div className="game-header">
      <p>{message}</p>
      {display}
    </div>
  );
}

function SpymasterControls({onSubmitClue}: {onSubmitClue: (clue: Clue) => void}) {
  const [word, setWord] = useState<string>("");
  const [number, setNumber] = useState<number>(1);
  const playerTeam = useAppSelector(selectPlayerTeam);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);

  if (!playerTeam) return null;

  const validWord = (w: string) => w.length > 0;
  const handleChangeWord = (e: FormEvent<HTMLInputElement>) => setWord(e.currentTarget.value.toUpperCase());
  const handleChangeNumber = (val: number) => setNumber(val);
  const handleSubmitClue = () => {
    if (validWord(word)) {
      onSubmitClue({word, number, team: playerTeam});
      setWord("");
      setNumber(1);
    }
  };

  return (
    <div className="spymaster-controls">
      <Input
        className="clue-word-input"
        type="text"
        placeholder="Enter a one-word clue"
        value={word}
        disabled={!isPlayerTurn}
        onChange={handleChangeWord}
      />
      <div className="number-buttons-container">
        {
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              disabled={!isPlayerTurn}
              onClick={() => handleChangeNumber(num)}
              pushed={num === number}
              variant={num === number ? playerTeam : undefined}
            >
              {num}
            </Button>
          ))
        }
      </div>
      <Button
        disabled={!isPlayerTurn || !validWord(word)}
        onClick={handleSubmitClue}
      >
        Submit
      </Button>
    </div>
  );
}

function OperativeControls({onEndTurn}: {onEndTurn: () => void}) {
  const canEndTurn = useAppSelector(state => state.room.game && state.room.game.turn.guessesLeft < state.room.game.turn.maxGuesses);

  return (
    <div className="operative-controls">
      <LatestClue />
      <Button
        disabled={!canEndTurn}
        onClick={onEndTurn}
      >
        Done guessing
      </Button>
    </div>
  );
}

function LatestClue() {
  const latestClue = useAppSelector(selectLatestClue);
  return (
    latestClue &&
      <div className="latest-clue">
        <div className={`clue-part ${latestClue.team}`}>
          {latestClue.word}
        </div>
        <div className={`clue-part ${latestClue.team}`}>
          {latestClue.number}
        </div>
      </div>
  );
}