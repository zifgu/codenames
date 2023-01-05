import React from "react";
import {useAppSelector} from "../redux/hooks";
import {selectIsPlayerTurn, selectPlayerRole, selectWinner} from "../slices/gameSlice";
import {CardData, Role} from "../types/types";
import "./CardGrid.css";
import {animated, useSpring} from "@react-spring/web";

export function CardGrid({cards, onSubmitGuess}: { cards: CardData[], onSubmitGuess: (cardIndex: number) => void }) {
  const playerRole = useAppSelector(selectPlayerRole);
  return (
    <div className="card-grid">
      {
        cards.map((card, index) => (
          playerRole === Role.SPYMASTER ?
            <SpymasterCard key={card.codename} card={card} /> :
            <OperativeCard key={card.codename} card={card} onSubmitGuess={() => onSubmitGuess(index)} />
        ))
      }
    </div>
  );
}

function SpymasterCard({card}: {card: CardData}) {
  const revealedClass = card.revealed ? " revealed" : "";
  return (
    <div className={`codename-card ${card.team}${revealedClass}`}>
      <div className="codename-card__label">
        {card.codename.toUpperCase()}
      </div>
    </div>
  );
}

function OperativeCard({card, onSubmitGuess}: {card: CardData, onSubmitGuess: () => void}) {
  const isPlayerTurn = useAppSelector(selectIsPlayerTurn);
  const winner = useAppSelector(selectWinner);

  const { transform } = useSpring({
    transform: `perspective(600px) rotateX(${card.revealed || winner ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const revealedClass = winner && card.revealed ? " revealed" : "";
  const canGuessCard = isPlayerTurn && !card.revealed && !winner;
  const interactibleClass = canGuessCard ? " interactible" : "";

  const handleGuess = () => {
    if (canGuessCard) {
      onSubmitGuess();
    }
  };

  return (
    <div className="flip-card__container">
      <animated.button
        className={`codename-card flip-card__face hidden${interactibleClass}`}
        tabIndex={canGuessCard ? 0 : -1}
        style={{transform}}
        onClick={handleGuess}
      >
        <div className="codename-card__label">
          {card.codename.toUpperCase()}
        </div>
      </animated.button>
      <animated.div
        className={`codename-card flip-card__face ${card.team}${revealedClass}`}
        style={{transform, rotateX: "180deg"}}
      >
        <div className="codename-card__label">
          {card.codename.toUpperCase()}
        </div>
      </animated.div>
    </div>
  );
}