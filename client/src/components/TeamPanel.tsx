import React from "react";
import Button from "react-bootstrap/Button";
import {Clue, Role, Team} from "../types/types";
import {useAppSelector} from "../redux/hooks";
import {selectPlayerTeam} from "../slices/gameSlice";

export function TeamPanel({team, onJoinTeam}: { team: Team, onJoinTeam: (team: Team, role: Role) => void }) {
  const gameState = useAppSelector(state => state.root.game);

  if (gameState === null) return null;

  return (
    <div className="h-100 d-flex flex-column gap-2">
      {team}
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
    <div className="border">Score: {score} / {targetScore}</div>
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

  return (
    <div className="border">
      Spymasters:
      <div>
        {
          spymaster &&
          <div key={spymaster.id}>{spymaster.id}</div>
        }
      </div>
      <Button
        disabled={playerTeam !== null || spymaster !== null}
        onClick={() => handleJoinButtonClick(Role.SPYMASTER)}
      >
        Join as spymaster
      </Button>
      Operatives:
      <div>
        {
          operatives.map((playerData) => (
            <div key={playerData.id}>{playerData.id}</div>
          ))
        }
      </div>
      <Button
        disabled={playerTeam !== null}
        onClick={() => handleJoinButtonClick(Role.OPERATIVE)}
      >
        Join as operative
      </Button>
    </div>
  );
}

function HistoryPanel({pastClues}: { pastClues: Clue[] }) {
  return (
    <div className="flex-grow-1 border">
      {
        pastClues.map((clue) => (
          <div key={clue.word}>{clue.word} ({clue.number})</div>
        ))
      }
    </div>
  );
}