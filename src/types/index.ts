import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  index: number;
}

export interface Command {
  type: string;
  data: string;
  id: number;
}

export enum CommandType {
  registration = 'reg',
  createGame = 'create_game',
  startGame = 'start_game',
  turn = 'turn',
  attack = 'attack',
  randomAttack = 'randomAttack',
  finish = 'finish',
  createRoom = 'create_room',
  updateRoom = 'update_room',
  addUserToRoom = 'add_user_to_room',
  updateWinners = 'update_winners',
  addShips = 'add_ships',
}

export enum AttackStatus {
  miss = 'miss',
  killed = 'killed',
  shot = 'shot',
}

export enum CellStatus {
  safe = 'safe',
  shot = 'shot',
  empty = 'empty',
}
