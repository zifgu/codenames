import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {useAppSelector} from "../redux/hooks";

export function GameWonModal() {
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