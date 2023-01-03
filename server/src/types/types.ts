export type PlayerId = string;

export enum CardTeam {
    RED = 0,
    BLUE = 1,
    BYSTANDER = 2,
    ASSASSIN = 3,
    UNKNOWN = 4,
}

export type Team = CardTeam.RED | CardTeam.BLUE;

export enum Role {
    SPYMASTER = 0,
    OPERATIVE = 1,
}

export interface CardData {
    codename: string,
    team: CardTeam,
    revealed: boolean,
}

export interface Clue {
    team: Team,
    word: string,
    number: number,
}

export interface PlayerData {
    id: PlayerId,

    team?: Team,
    role?: Role,
}

export interface Turn {
    team: Team,
    role: Role,
    hintNumber: number,
    guessesLeft: number,
}

export interface Score {
    [CardTeam.RED]: number,
    [CardTeam.BLUE]: number,
}

export interface GameState {
    // Players in game
    players: {
        [id: PlayerId]: PlayerData,
    },
    teams: {
        [CardTeam.RED]: {
            [Role.SPYMASTER]: PlayerId | null,
            [Role.OPERATIVE]: PlayerId[],
        },
        [CardTeam.BLUE]: {
            [Role.SPYMASTER]: PlayerId | null,
            [Role.OPERATIVE]: PlayerId[],
        },
    },

    // Game state
    cards: CardData[],
    turn: Turn,
    // TODO: refactor to team -> {score, targetScore, clues}?
    score: Score,
    targetScore: Score,
    pastClues: Clue[],
}

// Utility functions
export function teamToString(team: CardTeam) {
    switch (team) {
        case CardTeam.RED:
            return "red";
        case CardTeam.BLUE:
            return "blue";
        case CardTeam.BYSTANDER:
            return "bystander";
        case CardTeam.ASSASSIN:
            return "assassin";
        case CardTeam.UNKNOWN:
            return "unknown";
    }
}

export function getOppositeTeam(team: Team) {
    switch (team) {
        case CardTeam.RED:
            return CardTeam.BLUE;
        case CardTeam.BLUE:
            return CardTeam.RED;
    }
}

export function roleToString(role: Role) {
    switch (role) {
        case Role.SPYMASTER:
            return "spymaster";
        case Role.OPERATIVE:
            return "operative";
    }
}
