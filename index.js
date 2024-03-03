"use strict";
function drawCheckedBoard(ctx) {
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
const fillStates = ['#000000', '#FF5050'];
let app = document.getElementById("app");
if (app == null) {
    throw new Error(`Can't find canvas.`);
}
app.width = width;
app.height = height;
const CELL_WIDTH = app.width / BOARD_COL;
const CELL_HEIGHT = app.height / BOARD_ROW;
function createBoard() {
    let board = [];
    for (let r = 0; r < BOARD_ROW; ++r) {
        board.push(new Array(BOARD_COL).fill(0));
    }
    return board;
}
let currentBoard = createBoard();
let nextBoard = createBoard();
let ctx = app.getContext("2d");
if (ctx === null) {
    throw new Error(`can't get canvas context.`);
}
ctx.fillRect(0, 0, width, height);
function render(ctx, board) {
    for (let row = 0; row < BOARD_ROW; ++row) {
        for (let col = 0; col < BOARD_COL; ++col) {
            const x = row * CELL_HEIGHT;
            const y = col * CELL_WIDTH;
            ctx.fillStyle = fillStates[board[row][col]];
            ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}
function countNeighbours(board, neighbours, r0, c0) {
    neighbours.fill(0);
    for (let dr = -1; dr < 1; ++dr) {
        for (let dc = -1; dc < 1; ++dc) {
            if (dr != 0 || dc != 0) {
                let r = r0 + dr;
                let c = c0 + dc;
                if (0 <= r && r <= BOARD_ROW) {
                    if (0 <= c && c <= BOARD_COL) {
                        if (board[r][c] == 1) {
                            neighbours[board[r][c]]++;
                        }
                    }
                }
            }
        }
    }
}
//NOTE: Rules
// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
function generateNewBoard(currentBoard, nextBoard) {
    const DEAD = 0;
    const ALIVE = 1;
    const nbors = Array(2);
    for (let row = 0; row < BOARD_ROW; ++row) {
        for (let col = 0; col < BOARD_COL; ++col) {
            countNeighbours(currentBoard, nbors, row, col);
            console.log(nbors);
            if (currentBoard[row][col] == DEAD) {
                if (nbors[ALIVE] == 3) {
                    nextBoard[row][col] = 1;
                }
                else {
                    nextBoard[row][col] = 0;
                }
            }
            else {
                if (nbors[ALIVE] < 2) {
                    nextBoard[row][col] = 0;
                }
                else if (nbors[ALIVE] == 2 || nbors[ALIVE] == 3) {
                    nextBoard[row][col] = 1;
                }
                else if (nbors[ALIVE] > 3) {
                    nextBoard[row][col] = 0;
                }
            }
        }
    }
}
app.addEventListener("click", (e) => {
    let x = Math.floor(e.offsetX / CELL_HEIGHT);
    let y = Math.floor(e.offsetY / CELL_WIDTH);
    currentBoard[x][y] = 1;
    render(ctx, currentBoard);
});
let nextRender = document.getElementById("next");
nextRender.addEventListener("click", () => {
    generateNewBoard(currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
    render(ctx, currentBoard);
});
render(ctx, currentBoard);
