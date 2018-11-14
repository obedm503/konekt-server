import { Socket } from 'net';
import { Game } from './game';

export enum Player {
  A = 'A',
  B = 'B',
}

export type Message = {
  msg: string;
  sock: Socket;
  gameState: GameState;
};

export type GameState = {
  game: Game;
  [Player.A]: Socket;
  [Player.B]: Socket;
};

export enum Command {
  SUP = 'SUP',
  PUT = 'PUT',
  QUIT = 'QUIT',
}
export enum Response {
  GO = 'GO AHEAD',
  WAIT = 'WAIT',
  OK = 'OK',
  WIN = 'WIN',
  LOSE = 'LOSS',
  CAT = 'CAT',
  BYE = 'GOODBYE',
}

enum Errors {
  fullCol = 1,
  invalidCol = 2,
  invalidCommand = 3,
  samePlayer = 4,
}

export class GameError {
  constructor(msg?: string) {
    if (msg) {
      console.error(msg);
    }
  }
}

export class InvalidCommandError extends GameError {
  toString() {
    return `ERROR ${Errors.invalidCommand}`;
  }
}

export class InvalidColumnError extends GameError {
  toString() {
    return `ERROR ${Errors.invalidCol}`;
  }
}

export class FullColumnError extends GameError {
  toString() {
    return `ERROR ${Errors.fullCol}`;
  }
}

export class SamePlayerError extends GameError {
  toString() {
    return `ERROR ${Errors.samePlayer}`;
  }
}

export type CommandError =
  | FullColumnError
  | InvalidColumnError
  | InvalidCommandError
  | SamePlayerError;

export type Token = Player | '*';
export type Board = Array<Array<Token>>;
