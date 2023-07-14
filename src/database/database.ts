import { WebSocketClient } from '../types';
import { Connection, Game, Player, Room } from './interfaces';

class Database {
  connections: Connection;
  players: Player[];
  rooms: Room[];
  games: Game[];
  roomId: number;

  constructor() {
    this.connections = {};
    this.players = [];
    this.rooms = [];
    this.games = [];
    this.roomId = 0;
  }

  // player

  isPlayerExist = (name: string) => this.players.some((player) => player.name === name);

  addPlayer = (player: Player) => this.players.push(player);

  getPlayer = (wsIndex: number) =>
    this.players.find((player) => player.index === wsIndex) || console.log(`Player not found`);

  deletePlayer = (wsIndex: number) => {
    const deletedPlayer = this.getPlayer(wsIndex);
    if (deletedPlayer) this.players.splice(deletedPlayer.index, 1);
  };

  // room
  addRoom = ({ name, index }: Player) => {
    this.rooms.push({ roomId: this.roomId, roomUsers: [{ name, index }] });
    this.roomId++;
  };

  deleteRoom = (index: number) => (this.rooms = this.rooms.filter((room) => room.roomId !== index));

  isPlayerInThisRoom = (roomId: number, wsIndex: number) => {
    console.log(this.rooms.length);
    if (!this.rooms.length) return;
    return this.rooms[roomId]!.roomUsers.some((user) => user.index === wsIndex);
  };

  isPlayerInRooms = (index: number) => {
    if (!this.rooms.length) return;
    return this.rooms
      .map((room) => room.roomUsers)
      .flat()
      .find((user) => user.index === index);
  };

  getRoom = (index: number) => this.rooms.find((room) => room.roomId === index);

  isPlayersNumberAllowed = (roomId: number) => this.rooms[roomId]!.roomUsers.length < 2;

  addToRoom = (roomIndex: number, name: string, wsIndex: number) =>
    this.rooms[roomIndex]!.roomUsers.push({ name, index: wsIndex });

  // game

  addGame = (game: Game) => this.games.push(game);

  setConnection = (wsClient: WebSocketClient, index: number) => (this.connections[index] = wsClient);
}

export const database = new Database();
