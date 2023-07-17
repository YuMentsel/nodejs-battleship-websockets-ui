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
  const { name, password } = JSON.parse(message.data);
  if (database.isPlayerExist(name)) {
    const newMessage = updateMessage(name, -1, true, 'Player already exists');
    wsClient.send(JSON.stringify(newMessage));
  } else {
    const player = new BattleshipPlayer(name, password);
    const { index } = player;
    database.addPlayer(player);
    database.setConnection(wsClient, index);
    const newMessage = updateMessage(name, index, false, '');
    wsClient.index = index;
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
