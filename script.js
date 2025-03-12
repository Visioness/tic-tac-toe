function createPlayer(name, marker, color) {
  const getName = () => name;
  const getMarker = () => marker;
  const getColor = () => color;
 
  return { getName, getMarker, getColor };
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
  
  const start = (playerOne, playerTwo) => {
    // TEMP
    players.push(playerOne);
    players.push(playerTwo);

    round = 0;
    
    gameboard.create();
    console.log(playerOne.get);
    console.log(`The game has been started between ${playerOne.getName()} and ${playerTwo.getName()}`);
  }

  const playRound = (row, column) => {
    makeMove(row, column);
    if (over()) {
      // TEMP
      console.log("Restarting in 2 seconds!")
      return;
    }
    
    nextRound();
  }

  const reset = () => {
    players.length = 0;
  }
  
  const nextRound = () => {
    round++;
    gameboard.draw();
    console.log(`${turn().getName()}'s turn!`);
  }

  const turn = () => players[round % 2];

  const makeMove = (row, column) => gameboard.mark(turn().getMarker(), row, column);

  // Any win condition
  const checkWin = () => {
    return winningConditions.some(condition => 
      condition.every(([row, column]) => gameboard.currentState()[row][column] === turn().getMarker()))
  }

  const over = () => {
    if (checkWin()) {
      console.log(`${turn().getName()} WINS!`);
      return true;
    }
    
    if(!gameboard.currentState().flat().includes(null)) {
      console.log("TIE!");
      return true;
    }

    return false;
  }

  return { start, playRound, turn };
})();

const display = (function() {
  const gameboardElement = document.querySelector(".gameboard");
  const playerOneForm = document.querySelector("#form-one");
  const playerTwoForm = document.querySelector("#form-two");
  
  const initialize = () => {
    createBoard();
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
        let svg;
        
        if (game.turn().getMarker() == "x") {
          svg = drawX(game.turn().getColor());
        } else {
          svg = drawO(game.turn().getColor());
        }
        
        event.target.appendChild(svg);
        event.target.classList.add(game.turn().getMarker());
        event.target.classList.remove("empty");
        
        game.playRound(event.target.dataset.row, event.target.dataset.column);
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
        setTimeout(() => {
          form.parentElement.classList.add("removed");
          form.parentElement.classList.remove("ready");
          listenCellClicks();
        }, 1000);
      });

      game.start(
        createPlayer(
          playerOneForm.elements["player-name"].value,
          playerOneForm.elements["marker-type"].value,
          playerOneForm.elements["marker-color"].value
        ),
        createPlayer(
          playerTwoForm.elements["player-name"].value,
          playerTwoForm.elements["marker-type"].value,
          playerTwoForm.elements["marker-color"].value
        )
      )
    }
  }

  const drawX = (color) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "120");

    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.classList.add("line");
    line1.style.stroke = color;
    line1.setAttribute("x1", "10");
    line1.setAttribute("y1", "10");
    line1.setAttribute("x2", "110");
    line1.setAttribute("y2", "110");
    
    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.classList.add("line");
    line2.style.stroke = color;
    line2.setAttribute("x1", "110");
    line2.setAttribute("y1", "10");
    line2.setAttribute("x2", "10");
    line2.setAttribute("y2", "110");

    svg.appendChild(line1);
    setTimeout(() => {
      svg.appendChild(line2);
    }, 500)

    return svg;
  }

  const drawO = (color) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "120");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.classList.add("circle");
    circle.style.stroke = color;
    circle.setAttribute("cx", "60");
    circle.setAttribute("cy", "60");
    circle.setAttribute("r", "50");

    svg.appendChild(circle);

    return svg;
  }
  
  return { initialize, drawX, drawO };
})();

display.initialize();