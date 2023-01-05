import {codeNameWords} from "./words";
import {CardData, CardTeam, oppositeTeam, Team} from "./types/types";

export function getRandomCards(startingTeam: Team): CardData[] {
  const cards: CardData[] = [];
  const codeNames: string[] = randomCodeNames();
  const cardTeams: CardTeam[] = randomCardTeams(startingTeam);

  for (let i = 0; i < 25; i++) {
    cards.push({
      codename: codeNames[i],
      team: cardTeams[i],
      revealed: false,
    });
  }

  return cards;
}

function getAllCodeNames(): string[] {
  return codeNameWords.split("\n");
}

function randomCodeNames(): string[] {
  // Source: https://github.com/Gullesnuffs/Codenames/blob/master/wordlist-eng.txt
  const allCodeNames = getAllCodeNames();

  return selectRandom(allCodeNames, 25);
}

function randomCardTeams(startingTeam: Team): CardTeam[] {
  const cardTypes: CardTeam[] = Array<CardTeam>(25);

  const indices = Array.from(Array(25).keys());
  shuffleArray(indices);

  for (let i = 0; i < 25; i++) {
    if (i < 9) {
      cardTypes[indices[i]] = startingTeam;
    } else if (i < 17) {
      cardTypes[indices[i]] = oppositeTeam[startingTeam];
    } else if (i < 24) {
      cardTypes[indices[i]] = CardTeam.BYSTANDER;
    } else {
      cardTypes[indices[i]] = CardTeam.ASSASSIN;
    }
  }

  return cardTypes
}

// Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Source:
// https://stackoverflow.com/questions/196017/unique-non-repeating-random-numbers-in-o1
// https://stackoverflow.com/questions/7158654/how-to-get-random-elements-from-an-array
function selectRandom(array: any[], count: number): any[] {
  const min = array.length - count;

  for (let i = array.length - 1; i > min; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array.slice(min);
}