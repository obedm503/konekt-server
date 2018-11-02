import { range } from 'lodash';

export class Game {
  /**
   * rows and columns that represent the board. eventually, will be filled
   * with A and B tokens
   */
  board = range(6).map(() => range(7).map(() => '*'));
}
