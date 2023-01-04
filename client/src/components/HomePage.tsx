import React, {ReactNode, useEffect, useRef, useState} from "react";
import {RoomId} from "../types/types";
import {Button} from "./Button";
import "./HomePage.css";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface HomePageProps {
  nickname: string,
  roomId: RoomId,
  nicknameError: boolean,
  roomError: boolean,
  onChangeNickname: (nickname: string) => void,
  onChangeRoomId: (roomId: RoomId) => void,
  onCreateGame: () => void,
  onJoinGame: () => void,
}

export function HomePage({
                           nickname,
                           roomId,
                           nicknameError,
                           roomError,
                           onChangeNickname,
                           onChangeRoomId,
                           onCreateGame,
                           onJoinGame
                         }: HomePageProps) {
  const [page, setPage] = useState<null | "create" | "join">(null);
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

  let sidePage: ReactNode = null;
  if (page === "create") {
    sidePage = (
      <>
        <h3>Create game</h3>
        Give yourself a nickname:
        <Form.Control
          type="text"
          placeholder="Enter a nickname"
          value={nickname}
          onChange={(e) => onChangeNickname(e.currentTarget.value)}
        />
        <Button
          variant="light"
          onClick={onCreateGame}
          disabled={!nickname}
        >
          Create
        </Button>
      </>
    );
  } else if (page === "join") {
    sidePage = (
      <>
        <h3>Join game</h3>
        Enter room code:
        <Form.Control
          ref={roomInput}
          type="text"
          placeholder="Paste room code here..."
          value={roomId}
          onChange={(e) => onChangeRoomId(e.currentTarget.value)}
        />
        {
          roomError &&
          <div>Sorry, that room doesn't exist.</div>
        }
        Give yourself a nickname:
        <Form.Control
          ref={nicknameInput}
          type="text"
          placeholder="Enter a nickname..."
          value={nickname}
          onChange={(e) => onChangeNickname(e.currentTarget.value)}
        />
        {
          nicknameError &&
          <div>Sorry, that nickname is already taken.</div>
        }
        <Button
          variant="light"
          onClick={onJoinGame}
          disabled={!(roomId && nickname)}
        >
          Join
        </Button>
      </>
    );
  }

  return (
    <Container className="home">
      <Row>
        <Col xs={4}>
          <div className="title-page">
            <h1 className="title-page__title">
              <span className="text-red">CODE</span>
              <span className="text-blue">NAMES</span>
            </h1>
            <h4 className="title-page__subtitle">
              A game of...
            </h4>
            <Button
              variant="light"
              sizeVariant="lg"
              className="title-page__button"
              onClick={() => setPage("create")}
            >
              Create game
            </Button>
            <Button
              variant="light"
              sizeVariant="lg"
              className="title-page__button"
              onClick={() => setPage("join")}
            >
              Join game
            </Button>
          </div>
        </Col>
        <Col xs={8} className="side-page">
          {sidePage}
        </Col>
      </Row>
    </Container>
  );
}