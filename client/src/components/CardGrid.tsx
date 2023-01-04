import React from "react";
import {useAppSelector} from "../redux/hooks";
import {selectIsPlayerTurn, selectPlayerRole, selectWinner} from "../slices/gameSlice";
import {CardData, Role} from "../types/types";
import "./CardGrid.css";

export function CardGrid({cards, onSubmitGuess}: { cards: CardData[], onSubmitGuess: (cardIndex: number) => void }) {
  return (
    <div className="card-grid">
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
  const winner = useAppSelector(selectWinner);

  const cardClass = cardData.team; // classes named after team strings
  const revealedClass = cardData.revealed && (playerRole === Role.SPYMASTER || winner) ? " revealed" : "";

  const canGuessCard = isPlayerTurn && playerRole === Role.OPERATIVE && !cardData.revealed && !winner;
  const interactibleClass = canGuessCard ? " interactible" : "";

  const handleGuess = () => {
    if (canGuessCard) {
      onSubmitGuess(index);
    }
  }

  return (
    <button
      className={`codename-card ${cardClass}${revealedClass}${interactibleClass}`}
      tabIndex={canGuessCard ? 0 : -1}
      onClick={handleGuess}
    >
      <div className="codename-card__label">
        {cardData.codename.toUpperCase()}
      </div>
    </button>
  );
}