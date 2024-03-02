const width = 800;
const height = 800;
const BOARD_ROW = 32;
const BOARD_COL = BOARD_ROW;

let app = document.getElementById("app") as HTMLCanvasElement;
if (app == null) {
  throw new Error(`Can't find canvas.`);
}

app.width = width;
app.height = height;
const CELL_WIDTH = app.width / BOARD_COL;
const CELL_HEIGHT = app.height / BOARD_ROW;

type Board = Array<Array<number>>;
let board: Board = [];
for (let r = 0; r < BOARD_ROW; ++r) {
  board.push(new Array(BOARD_ROW).fill(0));
}


let ctx = app.getContext("2d") as CanvasRenderingContext2D;
if (ctx === null) {
  throw new Error(`can't get canvas context.`);
}

ctx.fillRect(0, 0, width, height);

function render() {
  ctx.fillStyle = "red";
  for (let row = 0; row < BOARD_ROW; ++row) {
    for (let col = 0; col < BOARD_COL; ++col) {
      if (board[row][col] == 1){ 
        const x = row * CELL_HEIGHT;
        const y = col * CELL_WIDTH;
        ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      }
    }
  }
}

//TODO: 
// function generateNewBoard(currentBoard:Board, nextBoard:Board){
//
// }

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

app.addEventListener("click", (e) => {
  console.log(`E as ${e.offsetX} ${e.offsetY}`);
  let x = Math.floor(e.offsetX/CELL_HEIGHT);
  let y = Math.floor(e.offsetY/CELL_WIDTH);
  console.log(x,y)
  board[x][y] = 1;
  render();
});

let nextRender = document.getElementById('next') as HTMLButtonElement;
nextRender.addEventListener('click', ()=>{
  //TODO: Next generation board
  render()
});
