import React, {useEffect, useRef, useState} from "react";
import {CardTeam, RoomId, Team} from "../types/types";
import {Button} from "./Button";
import "./HomePage.css";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Modal from "react-bootstrap/Modal";

type CreateGameHandler = (playerId: string, startingTeam: Team) => void;
type JoinGameHandler = (roomId: RoomId, nickname: string) => Promise<{ roomError: boolean, nicknameError: boolean }>;

export function HomePage({onCreateGame, onJoinGame}: {onCreateGame: CreateGameHandler, onJoinGame: JoinGameHandler}) {
  const [openPage, setOpenPage] = useState<null | "create" | "join">(null);

  return (
    <div className="fullscreen-center">
      <div className="home">
        <CreateGameModal
          show={openPage === "create"}
          onCreateGame={onCreateGame}
          onClose={() => setOpenPage(null)}
        />
        <JoinGameModal
          show={openPage === "join"}
          onJoinGame={onJoinGame}
          onClose={() => setOpenPage(null)}
        />
        <h1 className="home__title">
          <span className="text-red">CODE</span>
          <span className="text-blue">NAMES</span>
        </h1>
        <h5 className="home__subtitle">
          A social word game for 4-8 players.
        </h5>
        <Button
          variant="light"
          sizeVariant="lg"
          className="home__button"
          onClick={() => setOpenPage("create")}
        >
          Create game
        </Button>
        <Button
          variant="light"
          sizeVariant="lg"
          className="home__button"
          onClick={() => setOpenPage("join")}
        >
          Join game
        </Button>
        <a href="https://czechgames.com/files/rules/codenames-rules-en.pdf" target="_blank" rel="noreferrer">
          <Button
            variant="light"
            sizeVariant="lg"
            className="home__button"
          >
            How to play
          </Button>
        </a>
      </div>
    </div>
  );
}

function CreateGameModal({show, onCreateGame, onClose}: {show: boolean, onCreateGame: CreateGameHandler, onClose: () => void}) {
  const [nickname, setNickname] = useState<string>("");
  const [startingTeam, setStartingTeam] = useState<Team>(CardTeam.RED);

  return (
    <Modal show={show} centered className="creation-modal">
      <Modal.Header className="bg-red">
        Create a game
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>
            Choose which team goes first:
          </Form.Label>
          <ButtonGroup className="d-flex gap-2">
            <Button
              pushed={startingTeam === CardTeam.RED}
              variant={startingTeam === CardTeam.RED ? "red" : undefined}
              onClick={() => setStartingTeam(CardTeam.RED)}
            >
              Red
            </Button>
            <Button
              pushed={startingTeam === CardTeam.BLUE}
              variant={startingTeam === CardTeam.BLUE ? "blue" : undefined}
              onClick={() => setStartingTeam(CardTeam.BLUE)}
            >
              Blue
            </Button>
          </ButtonGroup>
        </Form.Group>
        <Form.Group className="mt-4">
          <Form.Label>
            Give yourself a nickname:
          </Form.Label>
          <Form.Control
            required
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.currentTarget.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => onCreateGame(nickname, startingTeam)}
          disabled={!nickname}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function JoinGameModal({show, onJoinGame, onClose} : {show: boolean, onJoinGame: JoinGameHandler, onClose: () => void}) {
  const [roomId, setRoomId] = useState<RoomId>("");
  const [nickname, setNickname] = useState<string>("");
  const [roomError, setRoomError] = useState(false);
  const [nicknameError, setNicknameError] = useState(false);
  const roomInput = useRef<HTMLInputElement>(null);
  const nicknameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roomInput.current && roomError) {
      roomInput.current.focus();
    }
  }, [roomError]);
  useEffect(() => {
    if (nicknameInput.current && nicknameError) {
      nicknameInput.current.focus();
    }
  }, [nicknameError]);

  const handleSubmit = async () => {
    setRoomError(false);
    setNicknameError(false);
    const result = await onJoinGame(roomId, nickname);
    if (result.roomError) {
      setRoomError(true);
    } else if (result.nicknameError) {
      setNicknameError(true);
    }
  }

  return (
    <Modal show={show} centered className="creation-modal">
      <Modal.Header className="bg-blue">
        Join a game
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>
            Paste the room code:
          </Form.Label>
          <Form.Control
            ref={roomInput}
            type="text"
            required
            value={roomId}
            isInvalid={roomError}
            onChange={(e) => setRoomId(e.currentTarget.value)}
          />
          {
            roomError &&
            <Form.Control.Feedback type="invalid">
              Sorry, that code doesn't match any room!
            </Form.Control.Feedback>
          }
        </Form.Group>
        <Form.Group className="mt-4">
          <Form.Label>
            Give yourself a nickname:
          </Form.Label>
          <Form.Control
            required
            ref={nicknameInput}
            type="text"
            value={nickname}
            isInvalid={nicknameError}
            onChange={(e) => setNickname(e.currentTarget.value)}
          />
          {
            nicknameError &&
            <Form.Control.Feedback type="invalid">
              Someone else is using that nickname! Pick another?
            </Form.Control.Feedback>
          }
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!(roomId && nickname)}
        >
          Join
        </Button>
      </Modal.Footer>
    </Modal>
  );
}