import { WebSocket } from 'ws';

export interface Player {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface Connection {
  [key: string]: WebSocket;
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
  boards: {
    [key: string]: Board;
  };
}

export interface Board {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}
