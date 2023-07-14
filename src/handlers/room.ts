import { Command } from '../types';
import { database, Game, Room } from '../database';

export const createRoom = (wsIndex: number) => {
  const { getPlayer, isPlayerInRooms, addRoom } = database;

  const player = getPlayer(wsIndex)!;

  if (isPlayerInRooms(player.index)) {
    console.log(`Player already exists`);
  } else {
    addRoom(player);
    updateRoom();
  }
  console.log('Rooms:', database.rooms);
};

export const updateRoom = () => {
  const { connections, rooms } = database;

  const newMessage: Command = {
    type: 'update_room',
    data: JSON.stringify(rooms),
    id: 0,
  };

  console.log('New message:', newMessage);

  Object.keys(connections).forEach((key) => {
    const client = connections[key];
    client ? client.send(JSON.stringify(newMessage)) : console.log(`Players not found`);
  });
};

export const addUserToRoom = (data: string, wsIndex: number) => {
  const { getPlayer, getRoom, addToRoom, isPlayersNumberAllowed, isPlayerInThisRoom } = database;
  const { indexRoom } = JSON.parse(data);
  const { name } = getPlayer(wsIndex)!;
  const room = getRoom(indexRoom);
  if (!room) return;
  const { roomId } = room;

  if (!isPlayerInThisRoom(roomId, wsIndex) && isPlayersNumberAllowed(roomId)) {
    addToRoom(roomId, name, wsIndex);
    console.log('Players in room:', database.rooms[roomId]!.roomUsers);
    updateRoom();
    createGame(room);
  }
};

export const createGame = (room: Room) => {
  const { connections, addGame } = database;

  const gameId = room.roomId;
  const newGame: Game = {
    gameId,
    players: [],
    boards: {},
  };
  room?.roomUsers.forEach(({ index }) => {
    newGame.players.push(index);

    const newMessage: Command = {
      type: 'create_game',
      data: JSON.stringify({
        idGame: gameId,
        idPlayer: index,
      }),
      id: 0,
    };
    connections[index]!.send(JSON.stringify(newMessage));
  });

  addGame(newGame);
};
