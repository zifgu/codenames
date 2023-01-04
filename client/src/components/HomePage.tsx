import {RoomId} from "../types/types";
import React, {useState} from "react";
import {Button} from "./Button";
import {Input} from "./Input";
import "./HomePage.css";

interface HomePageProps {
  nickname: string,
  roomId: RoomId,
  onChangeNickname: (nickname: string) => void,
  onChangeRoomId: (roomId: RoomId) => void,
  onCreateGame: () => void,
  onJoinGame: () => void,
}

export function HomePage({
                           nickname,
                           roomId,
                           onChangeNickname,
                           onChangeRoomId,
                           onCreateGame,
                           onJoinGame
                         }: HomePageProps) {
  const [page, setPage] = useState<"home" | "create" | "join">("home");
  if (page === "home") {
    return (
      <div className="fullscreen-center">
        <h1 className="home-title">
          <span className="text-red">CODE</span>
          <span className="text-blue">NAMES</span>
        </h1>
        <h4 className="home-subtitle">
          A game of...
        </h4>
        <Button
          variant="light"
          sizeVariant="lg"
          className="home-button"
          onClick={() => setPage("create")}
        >
          Create game
        </Button>
        <Button
          variant="light"
          sizeVariant="lg"
          className="home-button"
          onClick={() => setPage("join")}
        >
          Join game
        </Button>
      </div>
    );
  } else if (page === "create") {
    return (
      <div className="fullscreen-center">
        <div className="page-container">
          <h3>Create game</h3>
          Give yourself a nickname:
          <Input
            type="text"
            placeholder="Enter a nickname"
            value={nickname}
            onChange={(e) => onChangeNickname(e.currentTarget.value)}
          />
          <Button variant="light" onClick={onCreateGame}>Create</Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="fullscreen-center">
        <div className="page-container">
          <h3>Join game</h3>
          Enter Room ID:
          <Input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => onChangeRoomId(e.currentTarget.value)}
          />
          Give yourself a nickname:
          <Input
            type="text"
            placeholder="Enter a nickname"
            value={nickname}
            onChange={(e) => onChangeNickname(e.currentTarget.value)}
          />
          <Button variant="light" onClick={onJoinGame}>Join</Button>
        </div>
      </div>
    );
  }
}