import {CardTeam, Team} from "../types/types";
import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import {Button} from "./Button";

export function NewGameModal({show, onClose, onNewGame}: { show: boolean, onClose: () => void, onNewGame: (startingTeam: Team) => void }) {
  const [startingTeam, setStartingTeam] = useState<Team>(CardTeam.RED);
  return (
    <Modal show={show} centered>
      <Modal.Header className="bg-red">
        Start new game
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
        <div className="mt-4">
          <span className="text-gray">Note:</span> This will restart the game for everyone!
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => {
          onNewGame(startingTeam);
          onClose();
        }}>
          Create game
        </Button>
      </Modal.Footer>
    </Modal>
  );
}