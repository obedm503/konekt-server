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
  SUP_MULTI = 'SUP MULTIPLAYER',
  PUT = 'PUT',
  QUIT = 'QUIT',
}
export enum Response {
  GO = 'GO AHEAD\n',
  WAIT = 'WAIT\n',
}

enum Errors {
  fullCol = 1,
  invalidCol = 2,
  invalidCommand = 3,
}

class GameError {
  constructor(...msg: any[]) {
    console.error(...msg);
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

export type CommandError =
  | FullColumnError
  | InvalidColumnError
  | InvalidCommandError;
