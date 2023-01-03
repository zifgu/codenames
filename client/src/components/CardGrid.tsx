import React from "react";
import Button from "react-bootstrap/Button";
import {useAppSelector} from "../redux/hooks";
import {selectIsPlayerTurn, selectPlayerRole} from "../slices/gameSlice";
import {CardData, Role} from "../types/types";

export function CardGrid({cards, onSubmitGuess}: { cards: CardData[], onSubmitGuess: (cardIndex: number) => void }) {
  return (
    <div className="h-100 gap-2"
         style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gridTemplateRows: "1fr 1fr 1fr 1fr 1fr"}}>
      {
        cards.map((card, index) => (
          <Card key={card.codename} index={index} cardData={card} onSubmitGuess={onSubmitGuess}/>
        ))
      }
    </div>
  );
}

function Card({index, cardData, onSubmitGuess}: { index: number, cardData: CardData, onSubmitGuess: (cardIndex: number) => void }) {
  const playerRole = useAppSelector(selectPlayerRole);
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);

  const cardClass = cardData.team; // same string representation as team
  const revealedClass = (playerRole === Role.SPYMASTER && cardData.revealed) ? "revealed" : "";

  const handleGuess = () => onSubmitGuess(index);

  return (
    <div className={`d-flex flex-column justify-content-center codename-card ${cardClass} ${revealedClass}`}>
      {cardData.codename.toUpperCase()}
      {
        isPlayerTurn && playerRole === Role.OPERATIVE && !cardData.revealed &&
        <Button
          size="sm"
          variant="light"
          onClick={handleGuess}
        >
          Guess
        </Button>
      }
    </div>
  );
}