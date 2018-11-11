import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { flatMap, map, takeUntil } from 'rxjs/operators';
import { Cache } from './cache';
import {
  Command,
  GameState,
  InvalidColumnError,
  InvalidCommandError,
  Player,
  Response,
} from './types';

// socket events
// [
//   'close',
//   'connect',
//   'data',
//   'drain',
//   'end',
//   'error',
//   'lookup',
//   'timeout',
// ]

const gameCache = new Cache();

const PORT = process.env.PORT || 4444;
const server = createServer().listen(PORT);
console.info(`listening on localhost:${PORT}`);

const sock$ = fromEvent<Socket>(server, 'connection').pipe(
  takeUntil(fromEvent(server, 'close')),
);

sock$.subscribe(sock => {
  const name = sock.remoteAddress + ':' + sock.remotePort;
  console.log('CONNECTED: ', name);
});

const message$ = sock$.pipe(
  flatMap<Socket, { msg: string; sock: Socket }>(sock => {
    const closed$ = fromEvent<void>(sock, 'close');
    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(closed$),
      map(msg => ({ msg: msg.toString().trim(), sock })),
    );
  }),
);

const won = (state: GameState, player: Player) => {
  state[player].write(`WIN ${player}\n`);
  state[player].end();
};
const lost = (state: GameState, player: Player) => {
  state[player].write(`LOSE ${player}\n`);
  state[player].end();
};

let playerWaiting: Socket | undefined;
message$.subscribe(({ msg, sock }) => {
  try {
    console.info(`${sock.remoteAddress}:${sock.remotePort}`, msg);
    const gameState = gameCache.get(sock);

    if (msg.startsWith(Command.SUP) && gameState) {
      // already in a game
      throw new InvalidCommandError();
    }

    if (msg.startsWith(Command.SUP)) {
      if (msg === Command.SUP_MULTI) {
        if (playerWaiting) {
          gameCache.store(playerWaiting, sock);
          playerWaiting.write(Response.GO);
          playerWaiting = undefined;
        } else {
          playerWaiting = sock;
          sock.write(Response.WAIT);
        }
      } else if (msg === Command.SUP) {
        // single player
        throw new InvalidCommandError();
      } else {
        throw new InvalidCommandError();
      }

      return;
    }

    if (!gameState) {
      return;
    }

    const current = gameState[Player.A] === sock ? Player.A : Player.B;
    const other = gameState[Player.B] === sock ? Player.B : Player.A;

    if (msg === Command.QUIT) {
      lost(gameState, current);
      won(gameState, other);
      return;
    }

    if (msg.startsWith(Command.PUT)) {
      const col = Number(msg.slice(4));
      if (Number.isNaN(col)) {
        throw new InvalidColumnError();
      }

      gameState.game.put(col, current);
      gameState[current].write('OK\n');
      // pass it along
      gameState[other].write(msg);
      console.log(
        'are the same?',
        current,
        other,
        gameState[current] === gameState[other],
      );
    }

    if (gameState.game.didWin(current)) {
      won(gameState, current);
      lost(gameState, other);
      gameCache.remove(gameState);
    } else if (gameState.game.didWin(other)) {
      won(gameState, other);
      lost(gameState, current);
      gameCache.remove(gameState);
    }

    console.info('board:\n', gameState.game.toString());
  } catch (e) {
    sock.write(e.toString() + '\n');
  }
}, console.error);

// nodemon restart
process.once('SIGUSR2', () => {
  server.close();
  process.kill(process.pid, 'SIGUSR2');
});
