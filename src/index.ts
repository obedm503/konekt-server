import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { filter, flatMap, map, takeUntil } from 'rxjs/operators';
import { Cache } from './cache';
import { Command, GameError, InvalidColumnError, InvalidCommandError, Player, Response } from './types';
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
console.info(`listening on localhost:${PORT}`);

const sock$ = fromEvent<Socket>(server, 'connection').pipe(
  takeUntil(fromEvent(server, 'close')),
);

sock$.subscribe(sock => {
  console.log('CONNECTED: ', getName(sock));
});

const message$ = sock$.pipe(
  flatMap<Socket, { msg: string; sock: Socket }>(sock => {
    const closed$ = fromEvent<void>(sock, 'close');
    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(closed$),
      map(msg => ({ msg: msg.toString().trim(), sock })),
      filter(({ msg }) => !!msg.length), // ignore empty messages
    );
  }),
);

let playerWaiting: Socket | undefined;
message$.subscribe(({ msg, sock }) => {
  try {
    console.info(`${getName(sock)}`, msg);
    const state = gameCache.get(sock);

    if (msg.startsWith(Command.SUP) && state) {
      // already in a game
      throw new InvalidCommandError();
    }

    if (msg.startsWith(Command.SUP)) {
      if (msg === Command.SUP_MULTI) {
        if (playerWaiting) {
          gameCache.store(playerWaiting, sock);
          send(playerWaiting, Response.GO);
          playerWaiting = undefined;
        } else {
          playerWaiting = sock;
          send(sock, Response.WAIT);
        }
        return;
      } else if (msg === Command.SUP) {
        // single player
        throw new InvalidCommandError();
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
      return;
    }

    if (msg.startsWith(Command.PUT)) {
      const col = Number(msg.slice(4));
      if (Number.isNaN(col)) {
        throw new InvalidColumnError();
      }

      state.game.put(col, current);
      // pass it along
      send(state[other], msg);
    }

    const winner = state.game.check();

    if (!winner) {
      send(sock, Response.OK);
      return;
    }

    if (winner === current) {
      won(state, current);
      lost(state, other);
    } else {
      won(state, other);
      lost(state, current);
    }

    console.info(winner, 'won');
    console.info(state.game.toString());
    gameCache.remove(state);
  } catch (e) {
    if (e instanceof GameError && sock.writable) {
      send(sock, e.toString());
    } else {
      sock.end();
    }
  }
}, console.error);

// nodemon restart
process.once('SIGUSR2', () => {
  server.getConnections(connections => {
    console.info(`Had ${connections} live`);
    server.close();
    process.kill(process.pid, 'SIGUSR2');
  });
});
