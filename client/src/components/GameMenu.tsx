import React, {useState} from "react";
import {useAppSelector} from "../redux/hooks";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {Button} from "./Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy, faGear, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import "./GameMenu.css";
import {selectRoomId} from "../slices/gameSlice";

export function GameMenu({onLeaveGame, onClickNewGame}: {onLeaveGame: () => void, onClickNewGame: () => void}) {
  const handleLeaveButtonClick = () => onLeaveGame();

  return (
    <div className="game-menu px-3">
      <RoomInvite />
      <Button className="ms-auto" onClick={onClickNewGame}>
        New game
      </Button>
      <Button onClick={handleLeaveButtonClick} aria-label="Leave game">
        <FontAwesomeIcon icon={faRightFromBracket} fixedWidth/>
      </Button>
      <Button aria-label="Settings">
        <FontAwesomeIcon icon={faGear} fixedWidth/>
      </Button>
    </div>
  );
}

function RoomInvite() {
  const roomId = useAppSelector(selectRoomId);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopyButtonClick = async () => {
    await navigator.clipboard.writeText(roomId);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3 * 1000);
  };

  return (
    <div className="game-invite">
      <FormControl readOnly value={roomId} aria-label="Room code"/>
      <OverlayTrigger
        placement="bottom"
        show={showTooltip}
        overlay={
          <Tooltip>
            Copied!
          </Tooltip>
        }
      >
        <Button onClick={handleCopyButtonClick}>
          <FontAwesomeIcon icon={faCopy} fixedWidth aria-label="Copy room code"/>
        </Button>
      </OverlayTrigger>
    </div>
  );
}