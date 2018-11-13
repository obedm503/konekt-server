import { Game } from './game';
import { Player } from './types';

const diagonalLR = () => {
  const g = new Game();
  g.put(0, Player.A);

  g.put(1, Player.B);
  g.put(1, Player.A);

  g.put(6, Player.B);

  g.put(2, Player.A);
  g.put(2, Player.B);
  g.put(2, Player.A);

  g.put(3, Player.B);
  g.put(3, Player.A);
  g.put(3, Player.B);
  g.put(3, Player.A);

  return g;
};

const diagonalRL = () => {
  const g = new Game();
  g.put(6, Player.A);

  g.put(5, Player.B);
  g.put(5, Player.A);

  g.put(1, Player.B);

  g.put(4, Player.A);
  g.put(4, Player.B);
  g.put(4, Player.A);

  g.put(3, Player.B);
  g.put(3, Player.A);
  g.put(3, Player.B);
  g.put(3, Player.A);

  return g;
};

const tests = [diagonalLR, diagonalRL];

const success = tests.every(makeBoard => {
  const g = makeBoard();

  return g.check() === Player.A;
});

// let last: Player = Player.A;
// while (!(g.check() || g.full())) {
//   let success = false;
//   const tries: number[] = [];
//   while (!success) {
//     try {
//       const pick = Math.floor(Math.random() * 7);
//       if (tries.includes(pick)) {
//         continue;
//       }
//       g.put(pick, last);
//       success = true;
//     } catch {}
//   }
//   last = last === Player.A ? Player.B : Player.A;
// }

console.log('success?', success);
