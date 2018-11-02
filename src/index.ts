import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { filter, flatMap, map, takeUntil } from 'rxjs/operators';
import { Game } from './game';
import { validateCommand } from './protocol';

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
      map(data => ({ data: data.toString(), sock, game })),
    );
  }),
);

const invalid$ = message$.pipe(filter(({ data }) => !validateCommand(data)));
const valid$ = message$.pipe(filter(({ data }) => validateCommand(data)));

invalid$.subscribe(({ sock }) => {
  sock.write(`ERROR`);
});

valid$.subscribe(({ data, sock, game }) => {
  console.log(
    `${sock.remoteAddress}:${sock.remotePort}`,
    data,
    JSON.stringify({ board: game.board }),
  );
  // sock.write();
});
