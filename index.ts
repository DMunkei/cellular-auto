
function getElementOrError<T>(id:string): T{
  let element = document.getElementById(`${id}`) as T;
  if (element === null){
    throw new Error(`Can't find element ${element}.`);
  }
  return element;
}


function drawCheckedBoard(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#000000";
  for (let i = 0; i < CELL_HEIGHT + 1; ++i) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_HEIGHT, 0);
    ctx.lineTo(i * CELL_HEIGHT, height);
    ctx.stroke();
  }
  for (let i = 0; i < CELL_WIDTH + 1; ++i) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_WIDTH);
    ctx.lineTo(width, i * CELL_WIDTH);
    ctx.stroke();
  }
}

const ALIVE = 1;
const DEAD = 0;
const width = 800;
const height = 800;
const BOARD_ROW = 18;
const BOARD_COL = BOARD_ROW;

type Cell = number;

class Board {
  rows: number = 0;
  columns = 0;
  cells: Cell[][] = [];
  toroidalBoard: boolean = false;

  constructor(rows: number, cols: number, toroidal = false) {
    this.rows = rows;
    this.columns=cols;
    this.toroidalBoard = toroidal;
    this.generateBoard();
  }

  generateBoard() {
    for (let r = 0; r < this.rows; ++r) {
      let row: Cell[] = [];
      for (let c = 0; c < this.columns; ++c) {
        row.push(0);
      }
      this.cells.push(row);
    }
  }

  getCellState(row: number, col: number):number {
    if (this.toroidalBoard){
      row = this.posmod(row, this.rows);
      col = this.posmod(col, this.columns);

    }else {
      if (!this.inBounds(row,col)) return DEAD;
    }
    return this.cells[row][col] == 1? 1:0;
  }
  
  posmod(n:number, m:number){
    return (n%m+m)%m
  }

  wrapAround(cell:number){
    return cell%this.rows == 0? 0: cell;
  }

  setCellState(row: number, col: number, state: number) {
    this.cells[row][col] = state;
  }

  inBounds(row: number, col: number) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.columns;
  }

  countAliveNeighbours(r0: number, c0: number): number {
    let result: number = 0;
    for (let dr = -1; dr <= 1; ++dr)
      for (let dc = -1; dc <= 1; ++dc) {
        if (dr == 0 && dc == 0) continue;
        const nextX =  r0 + dr;
        const nextY =  c0 + dc;
        result += this.getCellState(nextX, nextY) === ALIVE ? ALIVE : DEAD;
      }
    return result;
  }

  configureBoard(configuration: number[][]) {
    for (let i = 0; i < configuration.length; ++i) {
      for (let j = 0; j < configuration[0].length; ++j) {
        this.cells[i][j] = configuration[i][j];
      }
    }
  }
}

const fillStates = ["#505050", "#FF5050"];

let app = getElementOrError<HTMLCanvasElement>('app');

app.width = width;
app.height = height;
const CELL_WIDTH = app.width / BOARD_COL;
const CELL_HEIGHT = app.height / BOARD_ROW;

let currentBoard: Board = new Board(BOARD_ROW, BOARD_COL, true);
let nextBoard: Board = new Board(BOARD_ROW, BOARD_COL, true);

let ctx = app.getContext("2d") as CanvasRenderingContext2D;
if (ctx === null) {
  throw new Error(`can't get canvas context.`);
}

ctx.fillRect(0, 0, width, height);

function render(ctx: CanvasRenderingContext2D, board: Board) {
  for (let row = 0; row < BOARD_ROW; ++row) {
    for (let col = 0; col < BOARD_COL; ++col) {
      const x = row * CELL_HEIGHT;
      const y = col * CELL_WIDTH;
      ctx.fillStyle = fillStates[board.getCellState(row, col)];
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    }
  }
}

//NOTE: Rules
// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
function generateNewBoard(currentBoard: Board, nextBoard: Board) {
  for (let row = 0; row < BOARD_ROW; ++row) {
    for (let col = 0; col < BOARD_COL; ++col) {
      const aliveNeighbors = currentBoard.countAliveNeighbours(row, col);
      let currentCellState = currentBoard.getCellState(row, col);
      let nextCellState = currentCellState;
      if (currentCellState == DEAD && aliveNeighbors == 3) nextCellState = ALIVE; //reproduction
      if (currentCellState == ALIVE && aliveNeighbors in [2, 3]) nextCellState = ALIVE; // next gen
      if (currentCellState == ALIVE && aliveNeighbors < 2) nextCellState = DEAD; //underpopulation
      if (currentCellState == ALIVE && aliveNeighbors > 3) nextCellState = DEAD; //overpopulation
      nextBoard.setCellState(row, col, nextCellState);
    }
  }
}

app.addEventListener("click", (e) => {
  let x = Math.floor(e.offsetX / CELL_HEIGHT);
  let y = Math.floor(e.offsetY / CELL_WIDTH);
  currentBoard.setCellState(x, y, 1);
  render(ctx, currentBoard);
  drawCheckedBoard(ctx);
});

let next = getElementOrError<HTMLButtonElement>("next");
let play = getElementOrError<HTMLButtonElement>("play");

let drawbtn = getElementOrError<HTMLButtonElement>("draw");
let stopbtn = getElementOrError<HTMLButtonElement>("stop");
let playbackSpeed = getElementOrError<HTMLInputElement>("playbackSpeed");

next.addEventListener("click", () => {
  generateNewBoard(currentBoard, nextBoard);
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  render(ctx, currentBoard);
  drawCheckedBoard(ctx);
});

let playbackID = -1;

play.addEventListener("click", () => {
  if (playbackID > -1) return;
  playbackID = setInterval(() => {
    generateNewBoard(currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
    render(ctx, currentBoard);
    drawCheckedBoard(ctx);
  }, playbackSpeed.valueAsNumber * 100);
});
stopbtn.addEventListener("click", () => {
  clearInterval(playbackID);
  playbackID = -1;
  playbackSpeed.value = "0";
});

render(ctx, currentBoard);

let configurations: number[][][] = [
  [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
];

let expectedResults = [0, 4, 8, 1, 3];

function testCountNeighbours(expected: number[], configurations: number[][][]) {
  let board = new Board(3, 3);
  for (let i = 0; i < configurations.length; ++i) {
    board.configureBoard(configurations[i]);
    console.log(
      `Expected ${expected[i]}, found: ${board.countAliveNeighbours(1, 1)} \ninside of board: ${board}`,
    );
  }
}
drawCheckedBoard(ctx);
testCountNeighbours(expectedResults, configurations);
