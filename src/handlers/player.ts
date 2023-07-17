import { database, Player } from '../database';
import { WebSocketClient, Command, CommandType } from '../types';
import { updateRoom } from './room';
import { updateWinners } from './game';

class BattleshipPlayer implements Player {
  static index = 0;
  index: number;
  name: string;
  password: string;
  wins: number;

  constructor(name: string, password: string) {
    this.index = BattleshipPlayer.index;
    this.name = name;
    this.password = password;
    this.wins = 0;
    BattleshipPlayer.index++;
  }
}

export const registration = (message: Command, wsClient: WebSocketClient) => {
  const { getPlayerByName, addPlayer, setConnection, players } = database;
  const { name, password } = JSON.parse(message.data);
  const existingPlayer = getPlayerByName(name);
  if (existingPlayer) {
    if (existingPlayer.password === password) {
      const index = Math.max(...players.map((player) => player.index)) + 1;
      BattleshipPlayer.index += 1;
      existingPlayer.index = index;
      setConnection(wsClient, index);
      wsClient.index = index;
      const newMessage = updateMessage(name, existingPlayer.index, false, '');
      wsClient.send(JSON.stringify(newMessage));
      updateRoom();
      updateWinners();
    } else {
      const newMessage = updateMessage(name, existingPlayer.index, true, 'Wrong password');
      wsClient.send(JSON.stringify(newMessage));
    }
  } else {
    const player = new BattleshipPlayer(name, password);
    const { index } = player;
    addPlayer(player);
    setConnection(wsClient, index);
    const newMessage = updateMessage(name, index, false, '');
    wsClient.index = index;
    wsClient.name = name;
    wsClient.send(JSON.stringify(newMessage));
    updateRoom();
    updateWinners();
  }
};

const updateMessage = (name: string, index: number, error: boolean, errorText: string) => {
  return {
    type: CommandType.registration,
    data: JSON.stringify({
      name,
      index,
      error,
      errorText,
    }),
    id: 0,
  };
};
