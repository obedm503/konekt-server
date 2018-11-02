enum Errors {
  fullCol = 1,
  invalidCol = 2,
  invalidCommand = 3,
}

export class InvalidCommandError {
  toString() {
    return `ERROR ${Errors.invalidCommand}`;
  }
}

export class InvalidColumnError {
  toString() {
    return `ERROR ${Errors.invalidCol}`;
  }
}

export class FullColumnError {
  toString() {
    return;
  }
}

export type CommandError =
  | FullColumnError
  | InvalidColumnError
  | InvalidCommandError;
