import { WebSocketClient } from '../types';
import { Connection, Game, Player, Room, Winner } from './interfaces';

class Database {
  connections: Connection;
  players: Player[];
  rooms: Room[];
  games: Game[];
  winners: Winner[];
  roomId: number;

  constructor() {
    this.connections = {};
    this.players = [];
    this.rooms = [];
    this.games = [];
    this.winners = [];
    this.roomId = 0;
  }

  // player

  isPlayerExist = (name: string) => this.players.some((player) => player.name === name);

  addPlayer = (player: Player) => this.players.push(player);

  getPlayerByName = (playerName: string) => this.players.find((player) => player.name === playerName);

  getPlayer = (wsIndex: number) =>
    this.players.find((player) => player.index === wsIndex) || console.log(`Player not found`);

  getPlayerIndex = (index: number) => this.players.findIndex((player) => player.index === index);

  deletePlayer = (index: number) => (this.players = this.players.filter((player) => player.index !== index));

  // room
  addRoom = ({ name, index }: Player) => {
    this.rooms.push({ roomId: this.roomId, roomUsers: [{ name, index }] });
    this.roomId++;
  };

  getRoom = (index: number) => this.rooms.find((room) => room.roomId === index);

  getRoomIndex = (index: number) => this.rooms.findIndex((room) => room.roomId === index);

  deleteRoom = (index: number) => (this.rooms = this.rooms.filter((room) => room.roomId !== index));

  deletePlayersRoom = (index: number) => {
    if (!this.rooms.length) return;
    const rooms = this.rooms
      .map((room) => room.roomUsers)
      .flat()
      .filter((user) => user.index === index);
    if (rooms) rooms.forEach((room) => this.deleteRoom(room.index));
  };

  isPlayerInThisRoom = (roomId: number, wsIndex: number, wsName: string) => {
    if (!this.rooms.length) return;
    return this.rooms[this.getRoomIndex(roomId)].roomUsers.some(
      (user) => user.index === wsIndex && user.name === wsName,
    );
  };

  isPlayerInRooms = (index: number) => {
    if (!this.rooms.length) return;
    return this.rooms
      .map((room) => room.roomUsers)
      .flat()
      .find((user) => user.index === index);
  };

  isPlayersNumberAllowed = (roomId: number, count: number) => this.rooms[roomId].roomUsers.length < count;

  addToRoom = (roomId: number, name: string, wsIndex: number) =>
    this.rooms[this.getRoomIndex(roomId)].roomUsers.push({ name, index: wsIndex });

  // game

  addGame = (game: Game) => this.games.push(game);

  getGame = (gameId: number) => this.games.find((game) => game.gameId === gameId)!;

  getGamesByName = (name: string) =>
    this.games.filter((game) => game.playersNames.some((playerName) => playerName === name));

  getOpponentIndex = (game: Game, indexPlayer: number) => game.players.filter((index) => index !== indexPlayer)[0];

  setConnection = (wsClient: WebSocketClient, index: number) => (this.connections[index] = wsClient);

  // winners

  isWinnersInDB = (name: string) => this.winners.some((winner) => winner.name === name);

  getWinnerIndex = (name: string) => this.winners.findIndex((winner) => winner.name === name);
}

export const database = new Database();
