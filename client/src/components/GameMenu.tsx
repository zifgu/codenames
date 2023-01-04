import React, {useState} from "react";
import {useAppSelector} from "../redux/hooks";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Input} from "./Input";
import {Button} from "./Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy, faGear, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import "./GameMenu.css";

export function GameMenu({onLeaveGame}: {onLeaveGame: () => void}) {
  const handleLeaveButtonClick = () => onLeaveGame();

  return (
    <div className="game-menu px-3">
      <RoomInvite />
      <Button className="ms-auto" onClick={handleLeaveButtonClick}>
        <FontAwesomeIcon icon={faRightFromBracket} fixedWidth/>
      </Button>
      <Button>
        <FontAwesomeIcon icon={faGear} fixedWidth/>
      </Button>
    </div>
  );
}

function RoomInvite() {
  const roomId = useAppSelector(state => state.root.roomId);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopyButtonClick = async () => {
    await navigator.clipboard.writeText(roomId);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3 * 1000);
  };

  return (
    <div className="game-invite">
      <Input readOnly value={roomId}/>
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
          <FontAwesomeIcon icon={faCopy} fixedWidth/>
        </Button>
      </OverlayTrigger>
    </div>
  );
}