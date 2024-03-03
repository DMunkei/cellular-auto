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

const width = 800;
const height = 800;
const BOARD_ROW = 18;
const BOARD_COL = BOARD_ROW;

interface Cell {
  state: number;
}

class Board {
  rows: number = 0;
  cols: number = 0;
  cells: Cell[][] = [];
  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.generateBoard();
  }

  generateBoard() {
    for (let r = 0; r < this.rows; ++r) {
      let row: Cell[] = [];
      for (let c = 0; c < this.cols; ++c) {
        row.push({ state: 0 });
      }
      this.cells.push(row);
    }
  }

  getCellState(row: number, col: number) {
    return this.cells[row][col].state !== undefined
      ? this.cells[row][col].state
      : 0;
  }

  setCellState(row: number, col: number, state: number) {
    this.cells[row][col].state = state;
  }

  inBounds(row: number, col: number) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  countAliveNeighbours(r0: number, c0: number): number {
    let result: number = 0;
    for (let dr = -1; dr <= 1; ++dr)
      for (let dc = -1; dc <= 1; ++dc) {
        if (dr == 0 && dc == 0) continue;
        if (!this.inBounds(dr + r0, dc + c0)) continue;
        result += this.getCellState(r0 + dr, c0 + dc) === 1 ? 1 : 0;
      }
    return result;
  }
  configureBoard(configuration: number[][]) {
    for (let i = 0; i < configuration.length; ++i) {
      for (let j = 0; j < configuration[0].length; ++j) {
        this.cells[i][j].state = configuration[i][j];
      }
    }
  }
}

const fillStates = ["#505050", "#FF5050"];

let app = document.getElementById("app") as HTMLCanvasElement;
if (app == null) {
  throw new Error(`Can't find canvas.`);
}

app.width = width;
app.height = height;
const CELL_WIDTH = app.width / BOARD_COL;
const CELL_HEIGHT = app.height / BOARD_ROW;

let currentBoard: Board = new Board(BOARD_ROW, BOARD_COL);
let nextBoard: Board = new Board(BOARD_ROW, BOARD_COL);

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
  const DEAD: number = 0;
  const ALIVE: number = 1;
  for (let row = 0; row < BOARD_ROW; ++row) {
    for (let col = 0; col < BOARD_COL; ++col) {
      const aliveNeighbors = currentBoard.countAliveNeighbours(row, col);
      let currentCellState = currentBoard.getCellState(row, col);
      let nextCellState = currentCellState;
      if (currentCellState == DEAD && aliveNeighbors == 3)
        nextCellState = ALIVE; //reproduction
      if (currentCellState == ALIVE && aliveNeighbors in [2, 3])
        nextCellState = ALIVE; // next gen
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

let nextRender = document.getElementById("next") as HTMLButtonElement;
let play = document.getElementById("play") as HTMLButtonElement;
let stopbtn = document.getElementById("stop") as HTMLButtonElement;
let playbackSpeed = document.getElementById(
  "playbackSpeed",
) as HTMLInputElement;
nextRender.addEventListener("click", () => {
  generateNewBoard(currentBoard, nextBoard);
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  render(ctx, currentBoard);
  drawCheckedBoard(ctx);
});

let playbackID = -1;

play.addEventListener("click", () => {
  console.log("doing work");
  if (playbackID > -1) return;
  playbackID = setInterval(() => {
    console.log(playbackSpeed.valueAsNumber * 500);
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
