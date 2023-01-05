export type PlayerId = string;
export type RoomId = string;

export enum CardTeam {
    RED = "red",
    BLUE = "blue",
    BYSTANDER = "bystander",
    ASSASSIN = "assassin",
    HIDDEN = "hidden",
}

export type Team = CardTeam.RED | CardTeam.BLUE;

export enum Role {
    SPYMASTER = "spymaster",
    OPERATIVE = "operative",
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

    team: Team | null,
    role: Role | null,
}

export interface Turn {
    team: Team,
    role: Role,
    maxGuesses: number,
    guessesLeft: number,
}

export interface Score {
    [CardTeam.RED]: number,
    [CardTeam.BLUE]: number,
}

export interface GameState {
    // Players in game
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
    score: Score,
    targetScore: Score,
    pastClues: Clue[],
    winner: null | Team,
}

export interface Players {
    [id: PlayerId]: PlayerData,
}

export interface Room {
    id: RoomId;
    players: Players,
    game: GameState;
}

// Utilities
export const oppositeTeam: {[team in Team]: Team} = {
    [CardTeam.RED]: CardTeam.BLUE,
    [CardTeam.BLUE]: CardTeam.RED,
}
