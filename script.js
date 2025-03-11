function createPlayer(name, marker, color) {
  const getName = () => name;
  const getMarker = () => marker;
  const changeName = (newName) => name = newName;
  const changeColor = (newColor) => color = newColor;
 
  return { getName, getMarker, changeName, changeColor };
}


const gameboard = (function() {
  const board = []
  
  const currentState = () => board;
  
  const create = () => {
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push(null);
      }
      board.push(row);
    }
  }

  const clear = () => board.length = 0;

  const draw = () => {
    for (let i = 0; i < 3; i++) {
      console.log(board[i]);
    }
  }
  
  const mark = (marker, row, column) => board[row][column] = marker; 

  return { create, currentState, clear, mark, draw };
})();


const game = (function() {
  const winningConditions = [
    [[0,0], [0,1], [0,2]], // Row 1
    [[1,0], [1,1], [1,2]], // Row 2
    [[2,0], [2,1], [2,2]], // Row 3
    [[0,0], [1,0], [2,0]], // Column 1
    [[0,1], [1,1], [2,1]], // Column 2
    [[0,2], [1,2], [2,2]], // Column 3
    [[0,0], [1,1], [2,2]], // Diagonal \
    [[0,2], [1,1], [2,0]]  // Diagonal /
  ];

  const players = [];
  let round;
  
  const initialize = () => {
    // TEMP
    const player1Info = {name:"Aygün", marker:"X", color:"crimson"};
    const player2Info = {name:"Burak", marker:"O", color:"dodgerblue"}

    const player1 = createPlayer(player1Info.name, player1Info.marker, player1Info.color);
    const player2 = createPlayer(player2Info.name, player2Info.marker, player2Info.color);
    
    players.push(player1);
    players.push(player2);

    round = 0;
    
    gameboard.create();
  }

  const play = () => {
    initialize();

    do {
      nextRound();
      playRound();
    } while (!over());
    
    setTimeout(() => {
      gameboard.clear();
      reset();
    }, 5000);
  }

  const playRound = () => {
    gameboard.draw();
    console.log(`${turn().getName()}'s turn!`);
    const [row, column] = prompt("Row and column to mark (row,column)").split(",").map(s => Number(s.trim()));
    
    makeMove(row, column);
  }

  const reset = () => {
    players.length = 0;
  }
  
  const nextRound = () => round++;

  const turn = () => players[round % 2];

  const makeMove = (row, column) => gameboard.mark(turn().getMarker(), row, column);

  // Any win condition
  const checkWin = () => {
    return winningConditions.some(condition => 
      condition.every(([row, column]) => gameboard.currentState()[row][column] === turn().getMarker()))
  }

  const over = () => {
    if (checkWin()) {
      console.log(`${turn().getName()} WINS`);
      return true;
    }
    
    if(!gameboard.currentState().flat().includes(null)) {
      console.log("TIE");
      return true;
    }

    return false;
  }

  return { play };
})();

const display = (function() {
  const gameboardElement = document.querySelector(".gameboard");
  const playerOneForm = document.querySelector("#form-one");
  const playerTwoForm = document.querySelector("#form-two");
  
  const initialize = () => {
    createBoard();
    listenCellClicks();
    listenForms();
  }
  
  const createBoard = () => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "empty");
        cell.setAttribute("data-row", `${i}`);
        cell.setAttribute("data-column", `${j}`);
        
        gameboardElement.appendChild(cell);
      }
    }
  }
  
  const listenCellClicks = () => {
    gameboardElement.addEventListener("click", (event) => {
      if (event.target.classList.contains("empty")) {
        // TODO
        console.log(`Clicked cell ${event.target.dataset.row}-${event.target.dataset.column}`);
      }
    })
  }

  const listenForms = () => {
    [playerOneForm, playerTwoForm].forEach(form => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.parentElement.classList.toggle("ready");
        checkReady();
      });
    });
  }

  const checkReady = () => {
    if ([playerOneForm, playerTwoForm].every(form => form.parentElement.classList.contains("ready"))) {
      [playerOneForm, playerTwoForm].forEach(form => {
        form.parentElement.classList.add("removed");
        form.parentElement.classList.remove("ready");
      });
    } else {
      [playerOneForm, playerTwoForm].forEach(form => {
        form.parentElement.classList.remove("removed");
      });
    }
  }
  
  return { initialize };
})();

display.initialize();
/*
game.play();
*/

