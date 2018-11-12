import { Socket } from 'net';
import { EOL } from 'os';
import { GameState, Player, Response } from './types';

export const getName = (sock: Socket) =>
  sock.remoteAddress + ':' + sock.remotePort;
export const send = (sock: Socket, msg: string) => sock.write(msg + EOL);

export const won = (state: GameState, player: Player) => {
  send(state[player], Response.WIN);
  state[player].end();
};
export const lost = (state: GameState, player: Player) => {
  send(state[player], Response.LOSE);
  state[player].end();
};
