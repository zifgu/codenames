import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {useAppSelector} from "../redux/hooks";
import {Button} from "./Button";
import "./WinModal.css";
import {CardTeam} from "../types/types";

export function GameWonModal() {
  const [show, setShow] = useState(false);
  const winner = useAppSelector(state => state.room.game ? state.room.game.winner : null);
  const score = useAppSelector(state => state.room.game ? state.room.game.score : null);

  useEffect(() => {
    setShow(winner !== null);
  }, [winner]);

  const handleClose = () => setShow(false);

  return (
    <Modal
      className="win-modal"
      show={show}
      centered
      backdrop="static"
      keyboard={false}
    >
      <div className={`win-modal__header ${winner} p-2`}>
        Game over!
      </div>
      <div className="win-modal__body p-4">
        <div className="mb-3"><span className={`text-${winner}`}>{winner}</span> has won!</div>
        {
          score &&
          <>
            <div><span className="text-red">{CardTeam.RED}</span> - {score[CardTeam.RED]} agents found</div>
            <div><span className="text-blue">{CardTeam.BLUE}</span> - {score[CardTeam.BLUE]} agents found</div>
          </>
        }
      </div>
      <div className="win-modal__footer pb-4">
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button>New game</Button>
      </div>
    </Modal>
  );
}