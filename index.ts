import { httpServer } from './src/http_server';
import { WebSocketServer } from 'ws';
import { WebSocketClient } from './src/types';
import { commandsSwitcher } from './src/controller';
import { database } from './src/database';
import { updateRoom } from './src/handlers';

const HTTP_PORT = 8181;
export const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`Start WS server on the ${WS_PORT} port!`);
});

wss.on('connection', (wsClient: WebSocketClient) => {
  wsClient.on('error', console.error);

  wsClient.on('message', (message: string) => commandsSwitcher(wsClient, message));

  wsClient.on('close', (code: number) => {
    console.log(`Client disconnected with code ${code} `);
    console.log(`Client numbers: ${wss.clients.size}`);
    database.deletePlayer(wsClient.index);
    database.deletePlayersRoom(wsClient.index);
    updateRoom();
  });
});

process.on('SIGINT', async () => {
  console.log('Server close');
  httpServer.close();
  process.exit(0);
});
