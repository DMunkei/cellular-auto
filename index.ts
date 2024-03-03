function drawCheckedBoard(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "white";
  for (let i = 0; i < CELL_HEIGHT + 1; ++i) {
    ctx.beginPath();
    ctx.moveTo(i * BOARD_ROW, 0);
    ctx.lineTo(i * BOARD_ROW, height);
    ctx.stroke();
  }
  for (let i = 0; i < CELL_WIDTH + 1; ++i) {
    ctx.beginPath();
    ctx.moveTo(0, i * BOARD_ROW);
    ctx.lineTo(width, i * BOARD_ROW);
    ctx.stroke();
  }
}

const width = 800;
const height = 800;
const BOARD_ROW = 32;
const BOARD_COL = BOARD_ROW;

const fillStates = ["#000000", "#FF5050"];

let app = document.getElementById("app") as HTMLCanvasElement;
if (app == null) {
  throw new Error(`Can't find canvas.`);
}

app.width = width;
app.height = height;
const CELL_WIDTH = app.width / BOARD_COL;
const CELL_HEIGHT = app.height / BOARD_ROW;

type Board = Array<Array<number>>;
function createBoard() {
  let board: Board = [];
  for (let r = 0; r < BOARD_ROW; ++r) {
    board.push(new Array(BOARD_COL).fill(0));
  }
  return board;
}
let currentBoard: Board = createBoard();
let nextBoard: Board = createBoard();

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
      ctx.fillStyle = fillStates[board[row][col]];
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    }
  }
}

function countAliveNeighbours(board: Board, r0: number, c0: number) {
  function inBounds(row:number, col:number){
    return (0<=row && row < BOARD_ROW) && (0<=col && col< BOARD_COL);
  }
  let result: number = 0;
  for (let dr = -1; dr <= 1; ++dr) {
    for (let dc = -1; dc <= 1; ++dc) {
      if (dr != 0 || dc != 0) {
        let r = r0 + dr;
        let c = c0 + dc;
        if (inBounds(r,c)){
          if (board[r][c] == 1) {
            result++;
          }
        }
      }
    }
  }
  return result;
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
      const aliveNeighbors = countAliveNeighbours(currentBoard, row, col);
      let currentCellState = currentBoard[row][col];
      let nextCellState = currentCellState;
      if (currentCellState == DEAD && aliveNeighbors == 3) nextCellState = ALIVE; //reproduction
      if (currentCellState == ALIVE && aliveNeighbors in [2, 3]) nextCellState = ALIVE; // next gen
      if (currentCellState == ALIVE && aliveNeighbors < 2) nextCellState = DEAD; //underpopulation
      if (currentCellState == ALIVE && aliveNeighbors > 3) nextCellState = DEAD; //overpopulation
      nextBoard[row][col] = nextCellState;
    }
  }
}

app.addEventListener("click", (e) => {
  let x = Math.floor(e.offsetX / CELL_HEIGHT);
  let y = Math.floor(e.offsetY / CELL_WIDTH);
  currentBoard[x][y] = 1;
  render(ctx, currentBoard);
});

let nextRender = document.getElementById("next") as HTMLButtonElement;
nextRender.addEventListener("click", () => {
  generateNewBoard(currentBoard, nextBoard);
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  render(ctx, currentBoard);
});

render(ctx, currentBoard);

let boards: Board[] = [
  [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 1],
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
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
];
let expectedResults = [0, 4, 8, 1, 3];

function testCountNeighbours(boards: Board[], expected: number[]) {
  for (let i = 0; i < boards.length; ++i) {
    let x = countAliveNeighbours(boards[i], 1, 1);
    console.log(
      `Expected ${expected[i]}, found: ${x} \ninside of board: ${boards[i]}`,
    );
  }
}
testCountNeighbours(boards, expectedResults);
