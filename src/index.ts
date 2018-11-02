import { createServer, Socket } from 'net';
import { fromEvent } from 'rxjs';
import { takeUntil, map, flatMap } from 'rxjs/operators';

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

const messages$ = socks$.pipe(
  flatMap(sock => {
    const close$ = fromEvent<void>(sock, 'close');
    return fromEvent<Buffer>(sock, 'data').pipe(
      takeUntil(close$),
      map(data => ({ data: data.toString(), sock })),
    );
  }),
);

socks$.subscribe(sock => {
  const name = sock.remoteAddress + ':' + sock.remotePort;
  console.log('CONNECTED: ', name);
});

messages$.subscribe(({ data, sock }) => {
  console.log(sock.remoteAddress + ':' + sock.remotePort, data);
});
