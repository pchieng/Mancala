/**
 * To-Do Items:
 * - Add pips
 * 
 */



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
  4, 4, 4, 4, 4, 4, 0, /* player 1 */ 4, 4, 4, 4, 4, 4, 0 /* player 2 */
];

const initialState = {
  board: initBoard, // from above
  numPlayers: 0, // number of players playing
  playerOneName: "",
  playerTwoName: "",
  currentPlayer: 1, // switch to 2 when the player swaps
  replayCondition: false, // False: Player switches turn, True: Player repeats turn
  emptyHoleCondition: false, //False: Ending hole was not empty, True: Ending hole was empty
  computersTurn: false, // False: Human player's turn, True: Computer's turn
  winner: 0 //0: Game in progress, 1: Player 1 wins the game, 2: Player 2 wins the game
};


let gameState;

// Returns game settings & name entries back to initial state
function buildInitialState() {
  gameState = JSON.parse(JSON.stringify(initialState));
  player1Name.value = "";
  player2Name.value = "";
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

// Reveals name entry screen and removes previous player selection buttons
function nameSetup() {
  playerSelection.style.display = "none";
  nameEntry.style.display = "block";
}

// Back button to return to home screen
backButton.addEventListener("click", function (event) {
  buildInitialState();
  playerSelection.style.display = "block";
  nameEntry.style.display = "none";
})

// Starts game with selected player names
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

// Computer opponent for single player
function computerPlayer() {
  let savedGameState = JSON.parse(JSON.stringify(gameState));
  let bestMove = {
    points: 0,
    index: 0
  }
  gameState.computersTurn = true;
  // Wait 4 seconds before the computer makes a move
  setTimeout(function () {
    // Check each option for the computer's move
    for (let i = 7; i <= 12; i++) {
      // Ignore holes without any pips
      if (gameState.board[i] === 0) {
        continue;
      } else {
        gameAction(i);
        // Save the hole that will result in the most points
        // Secondary preference for the furthest hole from the goal
        if (gameState.board[13] > bestMove.points) {
          bestMove.points = gameState.board[13];
          bestMove.index = i;
        }
      }
      gameState = JSON.parse(JSON.stringify(savedGameState));
    }
    gameState.computersTurn = false;
    // Computer makes the best move
    document.getElementById("hole" + bestMove.index).click();
    gameState.computersTurn = true;
  }, 4000)
}


function startGame() {
  player1ScoreName.innerText = gameState.playerOneName + ": ";
  player2ScoreName.innerText = gameState.playerTwoName + ": ";
  randomizeTurn();
  scoreboard.style.display = "flex";
  messageBar.style.display = "block";
  mancalaBoard.style.display = "flex";
  startOver.style.display = "block";
  nameEntry.style.display = "none";
  if (gameState.numPlayers === 1 && gameState.currentPlayer === 2) {
    computerPlayer();
  }
  renderState();
}

// Randomly chooses which player will start the game
function randomizeTurn() {
  gameState.currentPlayer = Math.floor(Math.random() * 2 + 1);
}



function createDiv(text, holeID) {
  let div = document.createElement("div");
  div.id = "pip";
  div.className = "pip" + holeID;
  div.appendChild(document.createTextNode(text));
  return div;
}



function collectDivs(numPips, holeID) {
  let divArray = [];
  if (numPips > 7) {
    numPips = 7;
  }
  for (let i = 0; i < numPips; i++) {
    divArray.push(createDiv(" ", holeID));
  }
  return divArray;
}

function clearPips(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}



function updatePips(numPips, holeID) {
  let element = document.getElementById("marble" + holeID)
  let divArray = collectDivs(numPips, holeID);
  let docFrag = document.createDocumentFragment();
  for (let i = 0; i < divArray.length; i++) {
    docFrag.appendChild(divArray[i]);
  }
  if (numPips !== 0 && numPips < 8) {
    clearPips(element);
    element.appendChild(docFrag);
  }
  if (numPips === 0 && holeID !== 6 && holeID !== 13) {
    clearPips(element);
  }
}



// Visually updates game board, score, and message bar with updated data
function renderState() {
  for (let i = 0; i < gameState.board.length; i++) {
    document.getElementById("hole" + i + "Header").innerText = gameState.board[i];
    if (i !== 6 && i !== 13) {
      updatePips(gameState.board[i], i);
    }
  }
  updateScore();
  updateMessage();
}


// Delays visual update to simulate pip motion after player's move
function delayedRender(currHole, origHole, loopStatus) {
  if (loopStatus) {
    setTimeout(function () {
      document.getElementById("hole" + currHole + "Header").innerText = gameState.board[currHole];
    }, (14 + currHole - origHole) * 280);

    if (currHole !== 6 && currHole !== 13) {
      setTimeout(function () {
        updatePips(gameState.board[currHole], currHole);
      }, (14 + currHole - origHole) * 280);
    }

  }
  else {
    setTimeout(function () {
      document.getElementById("hole" + currHole + "Header").innerText = gameState.board[currHole];
    }, (currHole - origHole) * 280);

    if (currHole !== 6 && currHole !== 13) {
      setTimeout(function () {
        updatePips(gameState.board[currHole], currHole);
      }, (currHole - origHole) * 280);
    }
  }
}



// Visually updates game board with a delay after player's move
function actionRenderState(holeID) {
  let origHole = holeID;
  let loopStatus = false;
  for (let i = holeID; i < gameState.board.length; i++) {
    delayedRender(i, origHole, loopStatus);
  }
  for (let j = 0; j < holeID; j++) {
    if (gameState.board[j] !== document.getElementById("hole" + j + "Header").innerText) {
      loopStatus = true;
      delayedRender(j, origHole, loopStatus);
    }
  }
  updateScore();
  updateMessage();
}




//  Updates players' scores
function updateScore() {
  document.getElementById("player1Score").innerText = gameState.board[6];
  document.getElementById("player2Score").innerText = gameState.board[13];
}


// Updates message bar with game & turn status
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

// Allows pips to travel in a CCW loop and skip the opponent's goal
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

// Move the number of pips in a hole
function moveStones(holeID) {
  let numStones = gameState.board[holeID];
  let currHole = holeID;
  gameState.board[currHole] = 0;
  for (let idx = 0; idx < numStones; idx++) {
    currHole = loopHoles(currHole);
    // Indicate whether the last hole is empty
    if (gameState.board[currHole] === 0) {
      gameState.emptyHoleCondition = true;
    } else {
      gameState.emptyHoleCondition = false;
    }
    gameState.board[currHole]++;
  }
  return currHole;
}

// Switches player turns
function switchPlayer() {
  if (gameState.currentPlayer === 1) {
    gameState.currentPlayer = 2;
  } else {
    gameState.currentPlayer = 1;
  }
}

// If a player ends their move by placing a pip in their own mancala, player gets to go again.
function replayCondition(endingHoleID) {
  if ((endingHoleID === 6 && gameState.currentPlayer === 1) || (endingHoleID === 13 && gameState.currentPlayer === 2)) {
    gameState.replayCondition = true;
  } else {
    switchPlayer();
    gameState.replayCondition = false;
  }
}

// Capture opponent pips when the player ends in an empty pip on their side
function steal(endingHoleID) {
  let oppHoleID;
  if (gameState.currentPlayer === 1) {
    oppHoleID = 12;
    for (let i = 0; i <= 5; i++) {
      if (i === endingHoleID) {
        gameState.board[6] += gameState.board[oppHoleID] + 1;
        gameState.board[oppHoleID] = 0;
        document.getElementById("hole" + oppHoleID).style.borderColor = "red";
        gameState.board[i] = 0;
        break;
      } else {
        oppHoleID -= 1;
      }
    }
  } else {
    oppHoleID = 5;
    for (let i = 7; i <= 12; i++) {
      if (i === endingHoleID) {
        gameState.board[13] += gameState.board[oppHoleID] + 1;
        gameState.board[oppHoleID] = 0;
        document.getElementById("hole" + oppHoleID).style.borderColor = "red";
        gameState.board[i] = 0;
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

// Adds the total number of pips on a players side to their mancala
function endGameTotal(sum1, sum2, endingPlayer) {
  if (endingPlayer === 1) {
    gameState.board[13] += sum2;
    for (let i = 7; i < 13; i++) {
      gameState.board[i] = 0;
    }
  } else if (endingPlayer === 2) {
    gameState.board[6] += sum1;
    for (let i = 0; i < 6; i++) {
      gameState.board[i] = 0;
    }
  }
}

// Determine which player wins or if it's a draw
function declareWinner() {
  if (gameState.board[6] > gameState.board[13]) {
    gameState.winner = 1;
  } else if (gameState.board[6] < gameState.board[13]) {
    gameState.winner = 2;
  } else if (gameState.board[6] === gameState.board[13]) {
    gameState.winner = 3;
  } else {
    gameState.winner = 0;
  }
}


function gameAction(holeID) {
  endingHole = moveStones(holeID);
  if (endGame() === 0) {
    stealCondition(endingHole);
    replayCondition(endingHole);
  }
  if (endGame() !== 0) {
    declareWinner();
  }
}

function resetBorders() {
  let hole = document.getElementsByClassName("hole");
  for (let i = 0; i < hole.length; i++) {
    hole[i].style.borderColor = "rgb(112, 80, 80)";
  }
}

function convertClassToID(target) {
  let conversion;

  if (target.id === "pip") {
    conversion = target.parentNode.id;
  } else {
    conversion = target.id;
  }
  conversion = conversion.replace("hole", "");
  conversion = conversion.replace("Header", "");
  conversion = conversion.replace("marble", "");
  return parseInt(conversion);
}

function callParentHoleID(target, holeID) {
  let selectedHole;
  if (target.className === "holeHeader" || target.className === "marble") {
    selectedHole = document.getElementById(target.parentNode.id);
  } else if (target.id === "pip") {
    selectedHole = document.getElementById(target.parentNode.parentNode.id);
  } else {
    selectedHole = document.getElementById(target.id);
  }
  return selectedHole;
}


document.querySelectorAll(".hole").forEach(item => {
  item.addEventListener("click", function (event) {
    let holeID = convertClassToID(event.target);
    if ((gameState.currentPlayer === 1 && holeID <= 5) || (!gameState.computersTurn && gameState.currentPlayer === 2 && (holeID >= 7 && holeID <= 12))) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = callParentHoleID(event.target);
        resetBorders();
        gameAction(holeID);
        actionRenderState(holeID);
        selectedHole.style.borderColor = "#448D76";
        if (gameState.numPlayers === 1 && gameState.currentPlayer === 2) {
          computerPlayer();
        }
      }
    }
  })
})








document.querySelectorAll(".plyr1Hole").forEach(item => {
  item.addEventListener("mouseover", function (event) {
    let holeID = convertClassToID(event.target);
    if (gameState.currentPlayer === 1 && holeID <= 5) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = callParentHoleID(event.target);
        selectedHole.style.borderColor = "#448D76";
      }
    }
  })
})

document.querySelectorAll(".plyr1Hole").forEach(item => {
  item.addEventListener("mouseout", function (event) {
    let holeID = convertClassToID(event.target);
    if (gameState.currentPlayer === 1 && holeID <= 5) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = callParentHoleID(event.target);
        selectedHole.style.borderColor = "rgb(112, 80, 80)";
      }
    }
  })
})


document.querySelectorAll(".plyr2Hole").forEach(item => {
  item.addEventListener("mouseover", function (event) {
    let holeID = convertClassToID(event.target);
    if (gameState.numPlayers === 2 && gameState.currentPlayer === 2 && (holeID >= 7 && holeID <= 12)) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = callParentHoleID(event.target);
        selectedHole.style.borderColor = "#448D76";
      }
    }
  })
})

document.querySelectorAll(".plyr2Hole").forEach(item => {
  item.addEventListener("mouseout", function (event) {
    let holeID = convertClassToID(event.target);
    if (gameState.numPlayers === 2 && gameState.currentPlayer === 2 && (holeID >= 7 && holeID <= 12)) {
      if (gameState.board[holeID] !== 0) {
        let selectedHole = callParentHoleID(event.target);
        selectedHole.style.borderColor = "rgb(112, 80, 80)";
      }
    }
  })
})







resetButton.addEventListener("click", function (event) {
  let player1 = gameState.playerOneName;
  let player2 = gameState.playerTwoName;
  let numPlayers = gameState.numPlayers;
  buildInitialState();
  gameState.playerOneName = player1;
  gameState.playerTwoName = player2;
  gameState.numPlayers = numPlayers;
  resetBorders();
  startGame();
})

homeButton.addEventListener("click", function (event) {
  buildInitialState();
  resetBorders();
  playerSelection.style.display = "flex";
  scoreboard.style.display = "none";
  messageBar.style.display = "none";
  mancalaBoard.style.display = "none";
  startOver.style.display = "none";
})

