/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const CURRENT_GAME_BOARDS = [];
const CURRENT_GAME_CLASSES = [];
const COLORS = ['Green', 'Purple', 'Red', 'Yellow', 'Blue', 'Orange', 'Teal', 'Pink'];
let gameCount = 1;

class Player {
  constructor(color) {
    this.color = color;
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
    // add our game holder to current games array
    CURRENT_GAME_BOARDS.push(game);
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
    // select the input for columns where we're adding pieces
    const currGame = document.querySelectorAll(`#${this.gameId} > #board`)[0];
    // select the destination for current piece we're placing in table
    const spot = currGame.querySelector(`#\\3${y}-${x}`);
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
    document.querySelector(`#${this.gameId} #board`).append(xImage);
    xImage.addEventListener('click', this.deleteGame.bind(this, document.querySelector(`#${this.gameId}`)));
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
      return this.endGame(`${this.currPlayer.color} player won!`);
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
      // remove currGame from the CURRENT_GAME_BOARDS array
      const currGame = CURRENT_GAME_BOARDS.indexOf(this);
      CURRENT_GAME_BOARDS.splice(currGame, 1);
      game.remove();
      CURRENT_GAME_CLASSES.splice(CURRENT_GAME_CLASSES.indexOf(this), 1);
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
  let player1 = new Player();
  let player2 = new Player();
  // shuffles our array of COLORS to randomize them
  shuffle(COLORS);
  // check to see if a color was entered for Player 1, if so then set it
  if (document.getElementById('player1-color').value !== '') {
    player1.color = document.getElementById('player1-color').value;
  }
  // if input value is empty, then choose the first element of our shuffled COLORS
  else if (document.getElementById('player1-color').value === '') {
    player1.color = COLORS[0];
  }
  // check to see if a color was entered for Player 2, if so then set it
  if (document.getElementById('player2-color').value !== '') {
    player2.color = document.getElementById('player2-color').value;
  }
  // if input value is empty, then choose the second element of our shuffled COLORS
  else if (document.getElementById('player2-color').value === '') {
    player2.color = COLORS[1];
  }
  // set our board dimmensions to be the value of the range sliders
  let boardHeight = document.getElementById('board-height').value;
  let boardWidth = document.getElementById('board-width').value;
  // make our new game with players and our dimmensions from input
  document.documentElement.style.setProperty('--color', player1.color)
  let newGame = new Game(player1, player2, boardHeight, boardWidth);
  CURRENT_GAME_CLASSES.push(newGame);
  document.getElementById(newGame.gameId).addEventListener('mouseenter', function (event) {
    if (CURRENT_GAME_CLASSES[CURRENT_GAME_CLASSES.indexOf(newGame)].currPlayer) {
      document.documentElement.style.setProperty('--color', CURRENT_GAME_CLASSES[CURRENT_GAME_CLASSES.indexOf(newGame)].currPlayer.color);
    } else {
      document.documentElement.style.setProperty('--color', CURRENT_GAME_CLASSES[CURRENT_GAME_CLASSES.indexOf(newGame)].player1.color)
    }
  })
});

// this gets our clear button, and adds a click event listener to remove all
// games in the CURRENT_GAME_BOARDS array
document.getElementById(`clear-games`).addEventListener('click', () => {
  CURRENT_GAME_BOARDS.forEach(game => {
    // deletes the HTML elements
    game.remove();
  });
  // sets the array back to 0
  CURRENT_GAME_BOARDS.length = 0;
  CURRENT_GAME_CLASSES.length = 0;
});

function showPlayerPiecePreview(row) {
  let img = document.createElement('img');
  img.classList.add('connect-4-image-preview');
  img.src = '/images/C4Piece.png'
  img.style.rotate = Math.floor(Math.random() * 360) + 'deg';
  row.target.append(img);
}
