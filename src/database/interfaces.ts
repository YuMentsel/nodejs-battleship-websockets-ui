import { ShipData } from './shipData';
import { WebSocketClient } from '../types';

export interface Player {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface Connection {
  [key: string]: WebSocketClient;
}

export interface Room {
  roomId: number;
  roomUsers: RoomUsers[];
}

interface RoomUsers {
  index: number;
  name: string;
}

export interface Game {
  gameId: number;
  players: number[];
  playersNames: string[];
  activePlayer: 1 | 0;
  shipData: {
    [key: string]: ShipData;
  };
}

export interface ShipCells {
  x: number;
  y: number;
  status: 1 | 3 | 4;
}
[];

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface Winner {
  name: string;
  wins: number;
}
