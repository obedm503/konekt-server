import { Socket } from 'net';
import { GameState, Player, Response } from './types';

export const getName = (sock: Socket) =>
  sock.remoteAddress + ':' + sock.remotePort;

export const send = (sock: Socket, msg: string) => {
  console.debug(`sent ${getName(sock)} "${msg}"`);
  return sock.write(msg);
};

export const won = (state: GameState, player: Player) => {
  send(state[player], Response.WIN);
  state[player].end();
};
export const lost = (state: GameState, player: Player) => {
  send(state[player], Response.LOSE);
  state[player].end();
};
