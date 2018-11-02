import { Game } from '../game';
import { CommandError, InvalidCommandError } from './errors';

export enum Commands {
  SUP = 'SUP',
  PUT = 'PUT',
  QUIT = 'QUIT',
}

type Validator = (msg: string, game: Game) => CommandError | undefined;

export const validators: { [key in Commands]: Validator } = {
  [Commands.SUP]: msg => msg === Commands.SUP || msg === 'SUP MULTIPLAYER',
  [Commands.PUT]: msg => {
    if (msg === Commands.PUT) {
      return new InvalidCommandError();
    }

  },
  [Commands.QUIT]: msg => msg === Commands.SUP || msg === 'SUP MULTIPLAYER',
};
