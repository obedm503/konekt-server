import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { filter, flatMap, map, takeUntil, tap } from 'rxjs/operators';
import { Cache } from './cache';
import {
  Command,
  GameError,
  InvalidColumnError,
  InvalidCommandError,
  Player,
  Response,
} from './types';
import { getName, lost, send, won } from './util';

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
console.info(`Listening on port ${PORT}`);

const sock$ = fromEvent<Socket>(server, 'connection').pipe(
  takeUntil(fromEvent(server, 'close')),
);

sock$.subscribe(sock => {
  console.log('\nCONNECTED: ', getName(sock));
  send(sock, 'HEY');
});

const onClose = (msg: string, sock: Socket) => () => {
  console.log('CLOSE: ', msg, getName(sock));

  if (msg === 'close') {
    return;
  }

  const state = gameCache.get(sock);
  if (!state) {
    return;
  }

  // close the other connection
  [Player.A, Player.B].forEach(player => {
    const s = state[player];
    if (s === sock) {
      return;
    }
    send(s, Response.BYE);

    if (s.writable) {
      s.end();
    }
  });
};

const message$ = sock$.pipe(
  flatMap<Socket, { msg: string; sock: Socket }>(sock => {
    const closed$ = fromEvent<void>(sock, 'close').pipe(
      tap(onClose('close', sock)),
    );
    const error$ = fromEvent<Error>(sock, 'error').pipe(
      tap(onClose('error', sock)),
    );
    const timeout$ = fromEvent<boolean>(sock, 'timeout').pipe(
      tap(onClose('timeout', sock)),
    );

    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(closed$),
      takeUntil(error$),
      takeUntil(timeout$),
      map(msg => ({ msg: msg.toString().trim(), sock })),
      filter(({ msg }) => !!msg.length), // ignore empty messages
    );
  }),
);

let playerWaiting: Socket | undefined;
message$.subscribe(({ msg, sock }) => {
  console.debug(`\ngot ${getName(sock)} "${msg}"`);

  try {
    if (!Object.values(Command).some(command => msg.startsWith(command))) {
      throw new InvalidCommandError();
    }

    const state = gameCache.get(sock);

    if (msg.startsWith(Command.SUP) && state) {
      // already in a game
      throw new InvalidCommandError();
    }

    if (msg.startsWith(Command.SUP)) {
      if (msg === Command.SUP) {
        if (playerWaiting) {
          gameCache.store(playerWaiting, sock);
          send(playerWaiting, Response.GO);
          send(sock, Response.WAIT);

          playerWaiting = undefined;
        } else {
          playerWaiting = sock;
          send(sock, Response.WAIT);
        }
        return;
      } else {
        throw new InvalidCommandError();
      }
    }

    if (!state) {
      throw new InvalidCommandError();
    }

    let current;
    let other;
    if (state[Player.A] === sock) {
      current = Player.A;
      other = Player.B;
    } else {
      current = Player.B;
      other = Player.A;
    }

    if (msg === Command.QUIT) {
      lost(state, current);
      won(state, other);
      gameCache.remove(state); // cleanup
      return;
    }

    if (msg.startsWith(Command.PUT)) {
      const col = Number(msg.slice(4));
      if (Number.isNaN(col)) {
        throw new InvalidColumnError();
      }

      state.game.put(col - 1, current);
      // pass it along
      send(state[other], msg);
    }

    const winner = state.game.check();
    const isFull = state.game.full();
    const gameOver = winner || isFull;

    if (!gameOver) {
      // normal play
      send(sock, Response.OK);
      send(state[other], Response.GO);
      console.debug(state.game.toString());
      return;
    }

    if (isFull) {
      // cat game
      send(sock, Response.CAT);
    }

    if (winner === current) {
      won(state, current);
      lost(state, other);
    } else {
      won(state, other);
      lost(state, current);
    }

    console.assert(winner, current + ' wins');
    console.debug(state.game.toString());

    gameCache.remove(state); // cleanup
  } catch (e) {
    if (e instanceof GameError && sock.writable) {
      send(sock, e.toString());
    } else {
      sock.end();
    }
    console.error(e.toString());
  }
}, console.error);

// nodemon restart
const production = process.env.NODE_ENV === 'production';
if (!production) {
  process.once('SIGUSR2', () => {
    server.getConnections((err, connections) => {
      console.info(`Had ${connections} live connections`);
      server.close();
      process.kill(process.pid, 'SIGUSR2');
    });
  });
}
