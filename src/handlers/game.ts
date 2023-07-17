import { CommandType, AttackStatus } from '../types';
import { Ship } from '../database/interfaces';
import { database } from '../database';
import { ShipData } from '../database/shipData';

export const addShips = (data: string, wsIndex: number) => {
  const { gameId, ships } = JSON.parse(data);

  const game = database.getGame(gameId);
  game.shipData[wsIndex] = new ShipData(ships);

  startGame(ships, wsIndex);
  turn(gameId);
};

const startGame = (ships: Ship[], wsIndex: number) => {
  const newMessage = {
    type: CommandType.startGame,
    data: JSON.stringify({
      ships,
      currentPlayerIndex: wsIndex,
    }),
    id: 0,
  };

  database.connections[wsIndex]!.send(JSON.stringify(newMessage));
};

export const turn = (gameId: number, status?: string) => {
  const { getGame, connections } = database;
  const game = getGame(gameId);
  const { activePlayer } = game;

  if (status === AttackStatus.miss) activePlayer === 0 ? (game.activePlayer = 1) : (game.activePlayer = 0);

  game.players.forEach((playerIndex) => {
    const newMessage = {
      type: CommandType.turn,
      data: JSON.stringify({
        currentPlayer: game.players[game.activePlayer],
      }),
      id: 0,
    };
    connections[playerIndex].send(JSON.stringify(newMessage));
  });
};

export const attack = (data: string, index: number) => {
  const { getGame, connections, getOpponentIndex } = database;
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const game = getGame(gameId);

  const activePlayer = game.players[game.activePlayer];
  if (activePlayer !== indexPlayer) return;

  const opponentIndex = getOpponentIndex(game, indexPlayer);
  const ship = game.shipData[opponentIndex];

  if (ship.field[x][y].checked) return;

  const { status, cellsAround } = ship.checkAttack(x, y);

  const sendAttackResponse = (status: AttackStatus, x: number, y: number, index: number) => {
    connections[index].send(attackResponse(status, x, y, index));
    connections[opponentIndex].send(attackResponse(status, x, y, index));
  };

  if (status === AttackStatus.killed) {
    sendAttackResponse(status, x, y, index);

    cellsAround?.forEach(([x, y]) => {
      sendAttackResponse(AttackStatus.miss, x, y, index);
    });

    if (ship.isFinished(ship.field)) {
      game.players.forEach((playerIndex) => {
        const newMessage = {
          type: CommandType.finish,
          data: JSON.stringify({
            winPlayer: index,
          }),
          id: 0,
        };
        connections[playerIndex].send(JSON.stringify(newMessage));
      });

      addWinner(index);
      return;
    }
  } else {
    sendAttackResponse(status, x, y, index);
  }

  turn(gameId, status);
};

const attackResponse = (status: string, x: number, y: number, playerIndex: number) => {
  const newMessage = {
    type: CommandType.attack,
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: playerIndex,
      status,
    }),
    id: 0,
  };

  return JSON.stringify(newMessage);
};

export const addWinner = (index: number) => {
  const { players, winners, getPlayerIndex, isWinnersInDB, getWinnerIndex } = database;
  const playerIndex = getPlayerIndex(index);
  const name = players[playerIndex].name;

  isWinnersInDB(name) ? winners[getWinnerIndex(name)].wins++ : winners.push({ name, wins: 1 });
  updateWinners();
};

const updateWinners = () => {
  const { connections, winners } = database;
  Object.keys(connections).forEach((key) => {
    const newMessage = {
      type: CommandType.updateWinners,
      data: JSON.stringify(winners),
      id: 0,
    };
    connections[key].send(JSON.stringify(newMessage));
  });
};

export const randomAttack = (data: string, index: number) => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const { getGame, getOpponentIndex } = database;
  const game = getGame(gameId);
  const opponentIndex = getOpponentIndex(game, indexPlayer);
  const field = game.shipData[opponentIndex].field;

  const availableCells = [];

  for (let x = 0; x < field.length; x++) {
    for (let y = 0; y < field.length; y++) {
      if (!field[x][y].checked) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) return;

  const randomCellIndex = Math.floor(Math.random() * availableCells.length);
  console.log('Random attack:', availableCells[randomCellIndex]);
  const { x, y } = availableCells[randomCellIndex];

  const newMessage = {
    gameId,
    x,
    y,
    indexPlayer: index,
  };

  attack(JSON.stringify(newMessage), index);
};

export const finishGame = (name: string) => {
  const { getGameByName, getNameIndex, connections } = database;
  const games = getGameByName(name);
  games.forEach((game) => {
    const index = getNameIndex(game, name);
    game.players.forEach((playerIndex) => {
      const newMessage = {
        type: CommandType.finish,
        data: JSON.stringify({
          winPlayer: index,
        }),
        id: 0,
      };
      connections[playerIndex].send(JSON.stringify(newMessage));
    });

    addWinner(index);
  });
};
