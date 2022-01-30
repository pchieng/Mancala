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



const messageBar = document.getElementById("messageBar");
const mancalaBoard = document.getElementById("mancalaBoard");


const initBoard = [
  4, 4, 4, 4, 4, 4, 0, /* player 1 */ 4, 4, 4, 4, 4, 4, 0 /* player 2 */
];

const initialState = {
  board: initBoard, // from above
  currentPlayer: 1, // switch to 2 when the player swaps
  message: "", // message to be displayed in message bar
  replayCondition: false, // False: Player switches turn, True: Player repeats turn
  emptyHoleCondition: false, //False: Ending hole was not empty, True: Ending hole was empty
  winner: 0 //0: Game in progress, 1: Player 1 wins the game, 2: Player 2 wins the game
};


let gameState;

buildInitialState();
renderState();



function buildInitialState() {
  gameState = initialState;
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
  if (gameState.replayCondition === true) {
    messageBar.innerText = "Player " + gameState.currentPlayer + ", go again!"
  } else {
    messageBar.innerText = "Player " + gameState.currentPlayer;
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
  } else {
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
  renderState();
}



document.querySelectorAll(".hole").forEach(item => {
  item.addEventListener("click", function (event) {
    let holeID = parseInt(event.target.id.replace("hole", ""));
    if ((gameState.currentPlayer === 1 && holeID <= 5) || (gameState.currentPlayer === 2 && (holeID >= 7 && holeID <= 12))) {
      if (gameState.board[holeID] !== 0) {
        gameAction(holeID);
      }
    }
  })
})




