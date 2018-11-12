import { findLastIndex, range } from 'lodash';
import { FullColumnError, InvalidColumnError, Player } from './types';

// messages SUP, PUT
// returns ERROR <number>, WAIT, GO AHEAD, WIN, LOSS, CAT

const EMPTY = '*';
type Token = Player | '*';
type Board = Array<Array<Token>>;

const makeMatch = (player: Player) =>
  range(4)
    .fill(player as any)
    .join('');

const checkCols = (board: Board, player: Player) => {
  const match = makeMatch(player);

  return board.some(col => {
    return col.join('').includes(match);
  });
};
const checkRows = (board: Board, player: Player) => {
  const match = makeMatch(player);

  const rows = range(6).map(i => {
    const row = board.map(col => col[i]);
    return row.join('');
  });
  return rows.some(row => {
    return row.includes(match);
  });
};
const checkDiagonal = (board: Board, player: Player) => false;

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
  board: Board = range(7).map(() => range(6).map(() => EMPTY as Token));

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
    const row = () => checkRows(this.board, player);
    const col = () => checkCols(this.board, player);
    const diagonal = () => checkDiagonal(this.board, player);

    return col() || row() || diagonal();
  }

  check(): Player | undefined {
    if (this.didWin(Player.A)) {
      return Player.A;
    }
    if (this.didWin(Player.B)) {
      return Player.B;
    }
  }

  fullBoard() {
    return this.board.every(col => col.every(token => token !== EMPTY));
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
