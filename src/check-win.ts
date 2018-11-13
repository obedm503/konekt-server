import { range } from 'lodash';
import { Board, Player, Token } from './types';

export const makeSeachString = (player: Player) =>
  range(4)
    .fill(player as any)
    .join('');

export const checkCols = (board: Board, search: string) => {
  return board.some(col => {
    return col.join('').includes(search);
  });
};
export const checkRows = (board: Board, search: string) => {
  const rows = range(6).map(i => {
    const row = board.map(col => col[i]);
    return row.join('');
  });
  return rows.some(row => {
    return row.includes(search);
  });
};

const diagonalCellsPerRow = [1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1];
const checkDiagonalLR = (board: Board, search: string) => {
  const copy: Board = JSON.parse(JSON.stringify(board));
  const diagonalBoard: Board = [];

  diagonalCellsPerRow.forEach((amount, amountI) => {
    const diagonalCol: Token[] = [];
    let rowI = amount;

    range(amount).forEach(colI => {
      rowI--;

      if (amountI === 6) {
        colI += 1;
      }

      diagonalCol.push(copy[colI][rowI]);
    });

    diagonalBoard.push(diagonalCol);
  });

  return checkCols(diagonalBoard, search);
};

const checkDiagonalRL = (board: Board, search: string) => {
  const copy: Board = JSON.parse(JSON.stringify(board));
  const diagonalBoard: Board = [];

  diagonalCellsPerRow.forEach((amount, amountI) => {
    const diagonalCol: Token[] = [];
    let rowI = amount;

    range(amount, 0).forEach(colI => {
      rowI--;

      if (amountI === 5) {
        colI -= 1;
      }

      diagonalCol.push(copy[colI][rowI]);
    });

    diagonalBoard.push(diagonalCol);
  });

  return checkCols(diagonalBoard, search);
};

export const checkDiagonal = (board: Board, search: string) => {
  return checkDiagonalLR(board, search) || checkDiagonalRL(board, search);
};
