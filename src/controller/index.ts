import { registration, createRoom, addUserToRoom } from '../handlers';
import { WebSocketClient, Command, CommandType } from '../types';

export const commandsSwitcher = (wsClient: WebSocketClient, message: string) => {
  try {
    const command: Command = JSON.parse(message.toString());
    const { type, data } = command;

    switch (type) {
      case CommandType.registration:
        registration(command, wsClient);
        break;
      case CommandType.createRoom:
        createRoom(wsClient.index);
        break;
      case CommandType.addUserToRoom:
        addUserToRoom(data, wsClient.index);
        break;
      default:
        console.log(`Command type: ${type}`);
        break;
    }
  } catch (error) {
    console.log(error);
  }
};
