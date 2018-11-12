import { findLastIndex, range } from 'lodash';
import { FullColumnError, InvalidColumnError, Player } from './types';

// messages SUP, PUT
// returns ERROR <number>, WAIT, GO AHEAD, WIN, LOSS, CAT

const EMPTY = '*';
type Token = Player | '*';

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
    range(6).map(() => EMPTY as Token),
  );

  put(colNum: number, player: Player) {
    const colIndex = colNum - 1; // make 0-indexed
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

  private didWin(player: Player): boolean {
    return true;
  }

  check(): Player | undefined {
    if (this.didWin(Player.A)) {
      return Player.A;
    }
    if (this.didWin(Player.B)) {
      return Player.B;
    }
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

export class SystemPlayer {}
export class UserPlayer {}
