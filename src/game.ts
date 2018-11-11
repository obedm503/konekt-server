import { findLastIndex, range } from 'lodash';
import { FullColumnError, InvalidColumnError, Player } from './types';

// messages SUP, PUT
// returns ERROR <number>, WAIT, GO AHEAD, WIN, LOSS, CAT

const EMPTY = '*';

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
  board: Array<Array<string>> = range(7).map(() => range(6).map(() => EMPTY));

  put(colIndex: number, player: Player) {
    const col = this.board[colIndex];
    if (!col) {
      throw new InvalidColumnError();
    }
    const cellIndex = findLastIndex(col, token => token === EMPTY);
    if (!col[cellIndex]) {
      throw new FullColumnError();
    }

    this.board[colIndex][cellIndex] = player;
  }

  didWin(player: Player): boolean {
    return true;
  }

  toString() {
    const invertedBoard: Array<Array<string>> = [];

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

export class SystemPlayer {}
export class UserPlayer {}
