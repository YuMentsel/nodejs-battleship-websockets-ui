import { Ship } from './interfaces';
import { CellStatus, AttackStatus } from '../types';

class Cell {
  x: number;
  y: number;
  status: CellStatus;
  checked: boolean;

  constructor(x: number, y: number, status: CellStatus) {
    (this.x = x), (this.y = y), (this.status = status), (this.checked = false);
  }
}

export class ShipData {
  ships: Ship[];
  field: Cell[][];
  shipCells: number[][][];

  constructor(ships: Ship[]) {
    this.ships = ships;
    this.shipCells = this.generateShipCells(ships);
    this.field = this.generateField();
  }

  generateShipCells = (ships: Ship[]) =>
    ships.map(({ position, direction, length }) => {
      const cells: number[][] = [];

      for (let i = 0; i < length; i++) {
        const { x, y } = position;
        const cell = direction ? [x, y + i] : [x + i, y];
        cells.push(cell);
      }

      return cells;
    });

  generateField = () => {
    const field: Cell[][] = [];

    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        const cell = new Cell(x, y, CellStatus.empty);
        row.push(cell);
      }
      field.push(row);
    }

    this.shipCells.flat().forEach(([x, y]) => (field[x][y].status = CellStatus.safe));
    return field;
  };

  getCellsAround = (shipIndex: number): number[][] => {
    const coordinates = this.shipCells[shipIndex];
    const { length } = coordinates;
    const [x, y] = coordinates[0];
    const { direction } = this.ships[shipIndex];

    const cellsAround: number[][] = [];

    const xFirst = Math.max(x - 1, 0);
    const yFirst = Math.max(y - 1, 0);
    const xLast = direction ? x + 1 : x + length;
    const yLast = direction ? y + length : y + 1;

    for (let i = xFirst; i <= xLast; i++) {
      for (let j = yFirst; j <= yLast; j++) {
        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
          this.field[i][j].checked = true;
          cellsAround.push([i, j]);
        }
      }
    }

    return cellsAround.filter(([x, y]) => coordinates.every(([cx, cy]) => cx !== x || cy !== y));
  };

  isKilled = (coordinates: number[][]) => coordinates.every(([x, y]) => this.field[x][y].status === CellStatus.shot);

  isFinished = (field: Cell[][]) => !field.flat().some((cell) => cell.status === CellStatus.safe);

  getShipIndex = (x: number, y: number) =>
    this.shipCells.findIndex((cells) => cells.some((cell) => cell[0] === x && cell[1] === y));

  checkAttack = (x: number, y: number) => {
    this.field[x][y].checked = true;

    const shipIndex = this.getShipIndex(x, y);
    if (shipIndex === -1) return { x, y, status: AttackStatus.miss };
    this.field[x][y].status = CellStatus.shot;

    const currentShip = this.shipCells[shipIndex];
    return this.isKilled(currentShip)
      ? { x, y, status: AttackStatus.killed, cellsAround: this.getCellsAround(shipIndex) }
      : { x, y, status: AttackStatus.shot };
  };
}
