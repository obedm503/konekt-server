import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { takeUntil, map, flatMap } from 'rxjs/operators';
import { Game } from './game';

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

const socks$ = fromEvent<Socket>(server, 'connection').pipe(
  takeUntil(fromEvent(server, 'close')),
);

socks$.subscribe(sock => {
  const name = sock.remoteAddress + ':' + sock.remotePort;
  console.log('CONNECTED: ', name);
});

const messages$ = socks$.pipe(
  flatMap(sock => {
    const close$ = fromEvent<void>(sock, 'close');
    const game = new Game();
    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(close$),
      map(data => ({ data: data.toString(), sock, game })),
    );
  }),
);

messages$.subscribe(({ data, sock, game }) => {
  console.log(
    `${sock.remoteAddress}:${sock.remotePort}`,
    data,
    JSON.stringify({ board: game.board }),
  );
  // sock.write();
});
