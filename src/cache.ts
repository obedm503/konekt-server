import { Socket } from 'net';
import { Game } from './game';
import { GameState, Player } from './types';

export class Cache {
  private states = new WeakMap<Socket, GameState>();
  get(sock: Socket) {
    return this.states.get(sock);
  }
  remove({ [Player.A]: sockA, [Player.B]: sockB }: GameState) {
    this.states.delete(sockA);
    this.states.delete(sockB);
  }

  store(sockA: Socket, sockB: Socket): GameState {
    if (sockA === sockB) {
      throw new Error('Cannot be same instance');
    }
    const state: GameState = {
      [Player.A]: sockA,
      [Player.B]: sockB,
      game: new Game(),
    };
    this.states.set(sockA, state);
    this.states.set(sockB, state);
    return state;
  }
}
