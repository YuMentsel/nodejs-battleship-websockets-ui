import { database, Player } from '../database';
import { WebSocketClient, Command, CommandType } from '../types';

class BattleshipPlayer implements Player {
  private static index = 0;
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
  const { getPlayerByName, addPlayer, setConnection } = database;
  const { name, password } = JSON.parse(message.data);
  const existingPlayer = getPlayerByName(name);
  if (existingPlayer) {
    if (existingPlayer.password === password) {
      const newMessage = updateMessage(name, existingPlayer.index, false, '');
      wsClient.send(JSON.stringify(newMessage));
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
