import { Command, CommandType } from '../types';
import { database, Game, Room } from '../database';

export const createRoom = (wsIndex: number) => {
  const { getPlayer, addRoom } = database;

  const player = getPlayer(wsIndex)!;

  addRoom(player);
  updateRoom();
};

export const updateRoom = () => {
  const { connections, rooms } = database;

  const newMessage: Command = {
    type: CommandType.updateRoom,
    data: JSON.stringify(rooms),
    id: 0,
  };


  Object.keys(connections).forEach((key) => connections[key].send(JSON.stringify(newMessage)));
};

export const addUserToRoom = (data: string, wsIndex: number) => {
  const { getPlayer, getRoom, addToRoom, deleteRoom, deletePlayersRoom, isPlayerInThisRoom } = database;
  const { indexRoom } = JSON.parse(data);
  const { name } = getPlayer(wsIndex)!;
  const room = getRoom(indexRoom)!;
  const { roomId } = room;

  if (!isPlayerInThisRoom(roomId, wsIndex)) {
    addToRoom(roomId, name, wsIndex);
    deleteRoom(roomId);
    deletePlayersRoom(wsIndex);
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
    shipData: {},
    activePlayer: 0,
  };
  room?.roomUsers.forEach(({ index }) => {
    newGame.players.push(index);

    const newMessage: Command = {
      type: CommandType.createGame,
      data: JSON.stringify({
        idGame: gameId,
        idPlayer: index,
      }),
      id: 0,
    };
    connections[index].send(JSON.stringify(newMessage));
  });

  addGame(newGame);
};
