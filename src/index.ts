import { createServer, Socket } from 'net';
import { fromEvent, Observable } from 'rxjs';
import { filter, flatMap, map, takeUntil } from 'rxjs/operators';
import { Game } from './game';
import { commandIsInvalid } from './protocol';

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

// nodemon restart
process.once('SIGUSR2', () => {
  server.close();
  process.kill(process.pid, 'SIGUSR2');
});
const HOST = '127.0.0.1';
const PORT = 4444;

const server = createServer().listen(PORT, HOST);
console.info(`listening on ${HOST}:${PORT}`);

const sock$ = fromEvent<Socket>(server, 'connection').pipe(
  takeUntil(fromEvent(server, 'close')),
);

sock$.subscribe(sock => {
  const name = sock.remoteAddress + ':' + sock.remotePort;
  console.log('CONNECTED: ', name);
});

const message$ = sock$.pipe(
  flatMap(sock => {
    const closed$ = fromEvent<void>(sock, 'close');
    const game = new Game();
    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(closed$),
      map(msg => ({ msg: msg.toString().trim(), sock, game })),
    );
  }),
);

const invalid$ = message$.pipe(
  map(({ msg, sock, game }) => ({
    sock,
    game,
    msg,
    error: commandIsInvalid(msg, game),
  })),
  filter(({ error }) => !!error),
);

invalid$.subscribe(({ sock, error }) => {
  if (!error) {
    return;
  }
  sock.write(error.toString());
});

const valid$ = message$.pipe(
  filter(({ msg, game }) => !commandIsInvalid(msg, game)),
);

valid$.subscribe(({ msg, sock, game }) => {
  console.log(
    `${sock.remoteAddress}:${sock.remotePort}`,
    msg,
    JSON.stringify({ board: game.board }),
  );
  // sock.write();
});
