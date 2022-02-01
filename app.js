// const mancalaBoard = document.getElementById("mancalaBoard");

// const func = function () {
//   console.log("Board Clicked")
// }

// mancalaBoard.addEventListener("click", func)

// let currentOperation = () => {};

// mancalaBoard.addEventListener("click", () => {
//   currentOperation = function (a,b) {

//   }
// })


// setinterval(tick, 1000)


const playerSelection = document.getElementById("playerSelection");
const singlePlayer = document.getElementById("singlePlayer");
const multiPlayer = document.getElementById("multiPlayer");
const playerTwoNameInput = document.getElementById("playerTwoNameInput");
const nameEntry = document.getElementById("nameEntry");
const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const backButton = document.getElementById("backButton");
const startButton = document.getElementById("startButton");

const player1ScoreName = document.getElementById("player1ScoreName");
const player2ScoreName = document.getElementById("player2ScoreName");
const scoreboard = document.getElementById("scoreboard");
const messageBar = document.getElementById("messageBar");
const mancalaBoard = document.getElementById("mancalaBoard");
const startOver = document.getElementById("startOver");
const resetButton = document.getElementById("resetButton");
const homeButton = document.getElementById("homeButton");

const initBoard = [
  0, 0, 0, 4, 4, 4, 0, /* player 1 */ 0, 5, 4, 0, 0, 1, 0 /* player 2 */
];

// const initBoard = [
//   4, 4, 4, 4, 4, 4, 0, /* player 1 */ 4, 4, 4, 4, 4, 4, 0 /* player 2 */
// ];

const initialState = {
  board: initBoard, // from above
  numPlayers: 0, // number of players playing
  playerOneName: "",
  playerTwoName: "",
  currentPlayer: 1, // switch to 2 when the player swaps
  message: "", // message to be displayed in message bar
  replayCondition: false, // False: Player switches turn, True: Player repeats turn
  emptyHoleCondition: false, //False: Ending hole was not empty, True: Ending hole was empty
  winner: 0 //0: Game in progress, 1: Player 1 wins the game, 2: Player 2 wins the game
};


let gameState;


function buildInitialState() {
  gameState = JSON.parse(JSON.stringify(initialState));
}

buildInitialState();


/** ====== Home Page Screen ====== */
// Select single or multiplayer

singlePlayer.addEventListener("click", function (event) {
  gameState.numPlayers = 1;
  playerTwoNameInput.style.display = "none";
  nameSetup();
})

multiPlayer.addEventListener("click", function (event) {
  gameState.numPlayers = 2;
  playerTwoNameInput.style.display = "inline-block";
  nameSetup();
})


/** ====== Player Name(s) Screen ====== */
// Enter Player Names


function nameSetup() {
  playerSelection.style.display = "none";
  nameEntry.style.display = "block";
}


backButton.addEventListener("click", function (event) {
  buildInitialState();
  playerSelection.style.display = "block";
  nameEntry.style.display = "none";
})

startButton.addEventListener("click", function (event) {
  if (player1Name.value !== "") {
    gameState.playerOneName = player1Name.value;
  } else {
    gameState.playerOneName = "Player 1"
  }
  if (gameState.numPlayers === 1) {
    gameState.playerTwoName = "Computer";
  } else if (gameState.numPlayers === 2 && player2Name.value !== "") {
    gameState.playerTwoName = player2Name.value;
  } else {
    gameState.playerTwoName = "Player 2"
  }
  startGame();
})


/** ====== Game Play Screen ======= */


function computerPlayer() {
  let savedGameState = JSON.parse(JSON.stringify(gameState));
  let bestMove = {
    points: 0,
    index: 0
  }
  for (let i = 7; i <= 12; i++) {
    if (gameState.board[i] === 0) {
      continue;
    } else {
      gameAction(i);
      if (gameState.board[13] > bestMove.points) {
        bestMove.points = gameState.board[13];
        bestMove.index = i;
      }
    }
    gameState = JSON.parse(JSON.stringify(savedGameState));
  }
  document.getElementById("hole" + bestMove.index).click();

}


function startGame() {
  player1ScoreName.innerText = gameState.playerOneName + ": ";
  player2ScoreName.innerText = gameState.playerTwoName + ": ";
  randomizeTurn();
  renderState();
  scoreboard.style.display = "flex";
  messageBar.style.display = "block";
  mancalaBoard.style.display = "flex";
  startOver.style.display = "block";
  nameEntry.style.display = "none";
  if (gameState.numPlayers === 1 && gameState.currentPlayer === 2) {
    computerPlayer();
  }
}


function randomizeTurn() {
  gameState.currentPlayer = Math.floor(Math.random() * 2 + 1);
}


function renderState() {
  for (let i = 0; i < gameState.board.length; i++) {
    document.getElementById("hole" + i).innerText = gameState.board[i];
  }
  updateScore();
  updateMessage();
}


function updateScore() {
  document.getElementById("player1Score").innerText = gameState.board[6];
  document.getElementById("player2Score").innerText = gameState.board[13];
}

function updateMessage() {
  if (gameState.winner === 1) {
    messageBar.innerText = gameState.playerOneName + " wins!";
  } else if (gameState.winner === 2) {
    messageBar.innerText = gameState.playerTwoName + " wins!";
  } else if (gameState.winner === 3) {
    messageBar.innerText = "Game Over. It's a draw!"
  } else if (gameState.replayCondition === true) {
    if (gameState.currentPlayer === 1) {
      messageBar.innerText = gameState.playerOneName + ", go again!";
    } else {
      messageBar.innerText = gameState.playerTwoName + ", go again!";
    }
  } else {
    if (gameState.currentPlayer === 1) {
      messageBar.innerText = gameState.playerOneName + ", it's your turn.";
    } else {
      messageBar.innerText = gameState.playerTwoName + ", it's your turn.";
    }
  }
}


function loopHoles(holeID) {
  let newHoleID;
  if (gameState.currentPlayer === 1 && holeID === 12) {
    newHoleID = 0;
  } else if (gameState.currentPlayer === 2 && holeID === 5) {
    newHoleID = 7;
  } else if (holeID === 13) {
    newHoleID = 0;
  } else {
    newHoleID = holeID + 1;
  }
  return newHoleID;
}


function moveStones(holeID) {
  let numStones = gameState.board[holeID];
  let currHole = holeID;
  gameState.board[currHole] = 0;
  // Add one stone to the following holes in a CCW loop.
  for (let idx = 0; idx < numStones; idx++) {
    currHole = loopHoles(currHole);
    if (gameState.board[currHole] === 0) {
      gameState.emptyHoleCondition = true;
    } else {
      gameState.emptyHoleCondition = false;
    }
    gameState.board[currHole]++;
  }
  return currHole;
}

function switchPlayer() {
  if (gameState.currentPlayer === 1) {
    gameState.currentPlayer = 2;
  } else {
    gameState.currentPlayer = 1;
  }
}

function replayCondition(endingHoleID) {
  if ((endingHoleID === 6 && gameState.currentPlayer === 1) || (endingHoleID === 13 && gameState.currentPlayer === 2)) {
    gameState.replayCondition = true;
  } else {
    switchPlayer();
    gameState.replayCondition = false;
  }
}

function steal(endingHoleID) {
  let oppHoleID;
  if (gameState.currentPlayer === 1) {
    oppHoleID = 12;
    for (let i = 0; i <= 5; i++) {
      if (i === endingHoleID) {
        gameState.board[6] += gameState.board[oppHoleID];
        // Need to enter click prompt here...
        gameState.board[oppHoleID] = 0;
        break;
      } else {
        oppHoleID -= 1;
      }
    }
  } else {
    oppHoleID = 5;
    for (let i = 7; i <= 12; i++) {
      if (i === endingHoleID) {
        gameState.board[13] += gameState.board[oppHoleID];
        // Need to enter click prompt here...
        gameState.board[oppHoleID] = 0;
        break;
      } else {
        oppHoleID -= 1;
      }
    }
  }
}


function stealCondition(endingHoleID) {
  if ((gameState.currentPlayer === 1 && endingHoleID <= 5 && gameState.emptyHoleCondition) ||
    (gameState.currentPlayer === 2 && (endingHoleID >= 7 && endingHoleID <= 12) && gameState.emptyHoleCondition)) {
    steal(endingHoleID);
  } else {
    gameState.emptyHoleCondition = false;
  }

}

function endGame() {
  let sum1 = 0;
  let sum2 = 0;
  let endingPlayer = 0;
  for (let i = 0; i < 6; i++) {
    sum1 += gameState.board[i];
  }
  for (let i = 7; i < 13; i++) {
    sum2 += gameState.board[i];
  }
  if (sum1 === 0) {
    endingPlayer = 1;
  } else if (sum2 === 0) {
    endingPlayer = 2;
  }
  endGameTotal(sum1, sum2, endingPlayer)
  return endingPlayer;
}


function endGameTotal(sum1, sum2, endingPlayer) {
  if (endingPlayer === 1) {
    gameState.board[6] += sum2;
    for (let i = 7; i < 13; i++) {
      gameState.board[i] = 0;
    }
  } else if (endingPlayer === 2) {
    gameState.board[13] += sum1;
    for (let i = 0; i < 6; i++) {
      gameState.board[i] = 0;
    }
  }
}


function declareWinner() {
  if (gameState.board[6] > gameState.board[13]) {
    gameState.winner = 1;
  } else if (gameState.board[6] < gameState.board[13]) {
    gameState.winner = 2;
  } else if (gameState.board[6] === gameState.board[13]) {
    gameState.winner = 3;
  }
  else {
    gameState.winner = 0;
  }
}


function gameAction(holeID) {
  endingHole = moveStones(holeID);
  if (endGame() === 0) {
    stealCondition(endingHole);
    replayCondition(endingHole);
  } else {
    declareWinner();
  }
}

function resetBorders() {
  let hole = document.getElementsByClassName("hole");
  for (let i = 0; i < hole.length; i++) {
    hole[i].style.borderColor = "rgb(112, 80, 80)";
  }
}

document.querySelectorAll(".hole").forEach(item => {
  item.addEventListener("click", function (event) {
    let holeID = parseInt(event.target.id.replace("hole", ""));
    if ((gameState.currentPlayer === 1 && holeID <= 5) || (gameState.numPlayers === 2 && gameState.currentPlayer === 2 && (holeID >= 7 && holeID <= 12))) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = document.getElementById(event.target.id);
        resetBorders();
        gameAction(holeID);
        renderState();
        selectedHole.style.borderColor = "#448D76";
        if (gameState.numPlayers === 1 && gameState.currentPlayer === 2) {
          computerPlayer();
        }
      }
    }
  })
})

resetButton.addEventListener("click", function (event) {
  let player1 = gameState.playerOneName;
  let player2 = gameState.playerTwoName;
  buildInitialState();
  gameState.playerOneName = player1;
  gameState.playerTwoName = player2;
  resetBorders();
  startGame();
})

homeButton.addEventListener("click", function (event) {
  buildInitialState();
  playerSelection.style.display = "flex";
  scoreboard.style.display = "none";
  messageBar.style.display = "none";
  mancalaBoard.style.display = "none";
  startOver.style.display = "none";
})

