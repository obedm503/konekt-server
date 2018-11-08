import { findLastIndex, range } from 'lodash';
import { FullColumnError, InvalidColumnError } from './protocol/errors';

// messages SUP, PUT
// returns ERROR <number>, WAIT, GO AHEAD, WIN, LOSS, CAT

export enum Token {
  EMPTY = '*',
  PLAYER_A = 'A',
  PLAYER_B = 'B',
}

export class Game {
  /**
   * rows and columns that represent the board. eventually, will be filled
   * with A and B tokens
   * columns are primary
   * [
   *       [*,*,*,*,*,*], // col 0
   *       [*,*,*,*,*,*] // col 1
   * // row 0,1,3,4,5,6
   * ]
   */
  board: Array<Array<Token>> = range(7).map(() =>
    range(6).map(() => Token.EMPTY),
  );

  put(colIndex: number, player: Token) {
    const col = this.board[colIndex];
    if (!col) {
      throw new InvalidColumnError();
    }
    const cellIndex = findLastIndex(col, token => token === Token.EMPTY);
    if (!col[cellIndex]) {
      throw new FullColumnError();
    }

    this.board[colIndex][cellIndex] = player;
  }

  didWin(player: Token): boolean {
    return true;
  }

  toString() {
    const invertedBoard: Array<Array<Token>> = [];

    this.board.forEach((col, colI) => {
      col.forEach((cell, rowI) => {
        if (!invertedBoard[rowI]) {
          invertedBoard[rowI] = [];
        }
        invertedBoard[rowI][colI] = cell;
      });
    });

    return invertedBoard.map(row => row.join(' ')).join('\n');
  }
}
