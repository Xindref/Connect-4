/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const CURRENT_GAMES = [];
const COLORS = ['#00FF00', '#B45AFF', '#FF0000', '#FFFF00', '#3C78FF', '#FF9600', '#00FFFF', '#FF78DC'];
let gameCount = 1;

class Player {
  constructor(color, name) {
    this.color = color;
    this.name = name;
  }
}

class Game {
  constructor(player1, player2, height, width) {
    this.players = [player1, player2];
    this.width = width;
    this.height = height;
    this.currPlayer = player1; // active player: 1 or 2
    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.gameId = '';
    this.gameOver = false;
    this.boardElement = '';
    this.makeBoard();
    this.makeHtmlBoard();
  }

  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */

  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    // create a game holder div
    const game = document.createElement('div');
    // set the id of our holder to be unique by using a total count of games played
    game.setAttribute('id', `Game${gameCount++}`);
    // set our gameId so that we can reference it later
    this.gameId = game.getAttribute('id');
    // add our game div to the game-container div
    document.getElementById('game-container').append(game);

    // create our board element
    const board = document.createElement('table');
    board.setAttribute('id', 'board');
    game.append(board);

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    // event listener needs to be bound to this
    top.addEventListener('click', this.handleClick.bind(this));

    // create the head cell td and apped it to our top element (the tr)
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }
    // append our new board to top, the tr
    board.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */
  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    // set our boardElement to be this game's board element
    this.boardElement = document.querySelector(`#${this.gameId} > #board`);
    // select the destination for current piece we're placing in table
    const spot = this.boardElement.querySelector(`#\\3${y}-${x}`);
    // add image for Connect 4 piece
    let img = document.createElement('img');
    img.classList.add('connect-4-image');
    img.src = '/images/C4Piece.png'
    img.style.rotate = Math.floor(Math.random() * 360) + 'deg';
    piece.append(img);
    // add piece to the table
    spot.append(piece);
    // add class for our bouncing animation
    piece.classList.add('bounce-top');
  }

  /** endGame: announce game end */
  endGame(msg) {
    // set gameOver boolean to true
    this.gameOver = true;
    // create a div to hold our X image to clear a specific game
    const xImage = document.createElement('div');
    xImage.classList.add('delete-game');
    this.boardElement.append(xImage);
    xImage.addEventListener('click', this.deleteGame.bind(this, this.boardElement.parentElement));
    // alert for who wins the game
    alert(msg);
  }

  /** handleClick: handle click of column top to play piece */
  handleClick(evt) {
    // if the game is over, ignore clicks
    if (this.gameOver) return;

    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) return;

    // place piece in board and add to HTML table
    this.updateGameState(x, y);
    this.updateBoardUI(x, y);

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`${this.currPlayer.name} won!`);
    }

    // check for tie
    if (this.checkForTie()) {
      return this.endGame('Tie!');
    }

    // switch players
    this.switchPlayers();

  }

  // this updates the currPlayers played piece position on the board virtually
  updateGameState(x, y) {
    this.board[y][x] = this.currPlayer;
  }

  // this updates our HTML board and changes the start position of our
  // animation that shows the pieces falling into place
  updateBoardUI(x, y) {
    this.placeInTable(y, x);
    if (y !== 0) {
      document.documentElement.style.setProperty('--height', `translateY(-${y * 70}px)`);
    } else {
      document.documentElement.style.setProperty('--height', `translateY(-${y + 50}px)`);
    }
  }

  // our logic for checking for ties
  checkForTie() {
    return this.board.every(row => row.every(cell => cell));
  }

  // switches players inside the players array assigned to this instance
  switchPlayers() {
    this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
    if (this.currPlayer) {
      document.documentElement.style.setProperty('--color', this.currPlayer.color);
    }
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */
  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
  // this deletes the current game
  deleteGame(game) {
    if (this.gameOver) {
      game.remove();
      // remove game instance from the CURRENT_GAMES array
      CURRENT_GAMES.splice(CURRENT_GAMES.indexOf(this), 1);
    }
  }
}

// this function shuffles an array to randomize the elements within
function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// gets the button for Start Game and adds a click event listener
document.getElementById('start-game').addEventListener('click', () => {
  // instantiate both our Player Objects for this board
  let player1 = new Player(getComputedStyle(document.documentElement).getPropertyValue('--p1StartColor'), 'Player 1');
  let player2 = new Player(getComputedStyle(document.documentElement).getPropertyValue('--p2StartColor'), 'Player 2');
  // set our board dimmensions to be the value of the range sliders
  let boardHeight = document.getElementById('board-height').value;
  let boardWidth = document.getElementById('board-width').value;
  // set initial color for P1 on a given game
  document.documentElement.style.setProperty('--color', player1.color)
  // make our new game with players and our dimmensions from input
  let newGame = new Game(player1, player2, boardHeight, boardWidth);
  CURRENT_GAMES.push(newGame);
  document.getElementById(newGame.gameId).addEventListener('mouseenter', function (event) {
    if (CURRENT_GAMES[CURRENT_GAMES.indexOf(newGame)].currPlayer) {
      document.documentElement.style.setProperty('--color', CURRENT_GAMES[CURRENT_GAMES.indexOf(newGame)].currPlayer.color);
    } else {
      document.documentElement.style.setProperty('--color', CURRENT_GAMES[CURRENT_GAMES.indexOf(newGame)].player1.color)
    }
  })
});

// this event listener deletes all games that are over
document.getElementById(`clear-completed-games`).addEventListener('click', () => {
  for (let i = CURRENT_GAMES.length - 1; i >= 0; i--) {
    let game = CURRENT_GAMES[i];
    if (game.gameOver) {
      CURRENT_GAMES.splice(i, 1);
      game.boardElement.parentElement.remove();
    }
  }
});

// this event listener deletes all games
document.getElementById(`clear-all-games`).addEventListener('click', () => {
  document.getElementById('game-container').innerHTML = '';
  //sets the array back to 0
  CURRENT_GAMES.length = 0;
});

document.getElementById('p1-color-picker').addEventListener('input', () => {
  let newColor = document.getElementById('p1-color-picker').value;
  document.documentElement.style.setProperty('--p1StartColor', newColor);
})

document.getElementById('p2-color-picker').addEventListener('input', () => {
  let newColor = document.getElementById('p2-color-picker').value;
  document.documentElement.style.setProperty('--p2StartColor', newColor);
})

document.addEventListener('DOMContentLoaded', function () {
  shuffle(COLORS);
  document.documentElement.style.setProperty('--p1StartColor', COLORS[0]);
  document.getElementById('p1-color-picker').setAttribute('value', COLORS[0]);
  document.documentElement.style.setProperty('--p2StartColor', COLORS[1]);
  document.getElementById('p2-color-picker').setAttribute('value', COLORS[1]);
})