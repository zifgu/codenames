import React from "react";
import {Clue, Role, Team} from "../types/types";
import {useAppSelector} from "../redux/hooks";
import {selectPlayerTeam} from "../slices/gameSlice";
import { Button } from "./Button";
import "./TeamPanel.css";

export function TeamPanel({team, onJoinTeam}: { team: Team, onJoinTeam: (team: Team, role: Role) => void }) {
  const gameState = useAppSelector(state => state.root.game);

  if (gameState === null) return null;

  return (
    <div className="team-panel">
      <div className={`team-panel__tab bg-${team}`}>
        {team}
      </div>
      <ScorePanel
        score={gameState.score[team]}
        targetScore={gameState.targetScore[team]}
      />
      <PlayersPanel team={team} onJoinTeam={onJoinTeam}/>
      <HistoryPanel
        pastClues={gameState.pastClues.filter((clue) => clue.team === team)}
      />
    </div>
  );
}

function ScorePanel({score, targetScore}: { score: number, targetScore: number }) {
  return (
    <div className="score">{score} / {targetScore} agents found</div>
  );
}

function PlayersPanel({team, onJoinTeam}: { team: Team, onJoinTeam: (team: Team, role: Role) => void}) {
  const gameState = useAppSelector(state => state.root.game);
  const playerTeam = useAppSelector(selectPlayerTeam);

  if (gameState === null) return null;

  const spymasterId = gameState.teams[team][Role.SPYMASTER];
  const spymaster = spymasterId ? gameState.players[spymasterId] : null;
  const operatives = gameState.teams[team][Role.OPERATIVE].map((id) => gameState.players[id]);

  const handleJoinButtonClick = (role: Role) => onJoinTeam(team, role);
  const placeholderIfEmpty = <div className="text-gray">None yet...</div>;

  return (
    <div className="players">
      <div className="players__heading">
        Spymaster:
        {playerTeam === null &&
          <Button
            sizeVariant="sm"
            disabled={spymaster !== null}
            onClick={() => handleJoinButtonClick(Role.SPYMASTER)}
          >
            Join
          </Button>
        }
      </div>
      {
        spymaster ?
          <div className={`text-${team}`}>{spymaster.id}</div> :
          placeholderIfEmpty
      }
      <div className="players__heading mt-2">
        Operatives:
        {playerTeam === null &&
          <Button
            sizeVariant="sm"
            onClick={() => handleJoinButtonClick(Role.OPERATIVE)}
          >
            Join
          </Button>
        }
      </div>
      {
        operatives.length > 0 ?
          operatives.map((playerData) => (
            <div className={`text-${team}`} key={playerData.id}>{playerData.id}</div>
          )) :
          placeholderIfEmpty
      }
    </div>
  );
}

function HistoryPanel({pastClues}: { pastClues: Clue[] }) {
  return (
    <div className="history">
      <div className="mb-2">Clues:</div>
      {
        pastClues.length > 0 ?
          pastClues.reverse().map((clue) => (
            <div key={clue.word}>{clue.word} ({clue.number})</div>
          )) :
          <div className="text-gray">None yet...</div>
      }
    </div>
  );
}