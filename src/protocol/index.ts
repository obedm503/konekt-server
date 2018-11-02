import { CommandError, InvalidCommandError } from './errors';
import { Commands, validators } from './commands';
import { Game } from '../game';

export const commandIsInvalid = (command: string, game: Game): CommandError | undefined => {
  const valid = Object.values(Commands).some(name => command.startsWith(name));
  if (!valid) {
    return new InvalidCommandError();
  }

  let validator;
  if (command.startsWith(Commands.PUT)) {
    return validators.PUT(command, game);
  } else if (command.startsWith(Commands.SUP)) {
    return validators.SUP(command, game);
  } else if (command === Commands.QUIT) {
    return validators.QUIT(command, game);
  }

  return new InvalidCommandError();
};
