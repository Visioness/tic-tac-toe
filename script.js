/*
 - Tic Tac Toe Game
*/

// Player Factory - Creates player objects
const Player = (name, marker, color) => {
  let score = 0;
  
  const getName = () => name;
  const getMarker = () => marker;
  const getColor = () => color;
  const getScore = () => score;
  const incrementScore = () => score++;
  const resetScore = () => score = 0;
 
  return { getName, getMarker, getColor, getScore, incrementScore, resetScore };
};

// GameBoard Module - Manages the state of the game board
const GameBoard = (() => {
  const board = [];
  
  const create = () => {
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        row.push(null);
      }
      board.push(row);
    }
  };

  const getState = () => board;
  
  const clear = () => board.length = 0;

  const reset = () => {
    clear();
    create();
  };
  
  const mark = (marker, row, column) => {
    if (row >= 0 && row < 3 && column >= 0 && column < 3) {
      board[row][column] = marker;
      return true;
    }
    return false;
  };

  const isCellEmpty = (row, column) => board[row][column] === null;

  return { create, reset, getState, mark, isCellEmpty };
})();

// GameController Module - Controls game flow and logic
const GameController = (() => {
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
  let currentRound;
  let orderReversed = false;
  let gameActive = false;
  
  const initialize = (playerOne, playerTwo) => {
    players.length = 0;
    players.push(playerOne);
    players.push(playerTwo);

    currentRound = 0;
    orderReversed = false;
    gameActive = true;
    GameBoard.create();
  };

  const getCurrentPlayer = () => players[currentRound % 2];
  
  const getPlayers = () => players;

  const makeMove = (row, column) => {
    if (!gameActive || !GameBoard.isCellEmpty(row, column)) return false;
    
    GameBoard.mark(getCurrentPlayer().getMarker(), row, column);
    return true;
  };

  const checkForWin = () => {
    const currentMarker = getCurrentPlayer().getMarker();
    const board = GameBoard.getState();
    
    return winningConditions.some(condition => 
      condition.every(([row, column]) => board[row][column] === currentMarker));
  };

  const checkForTie = () => {
    return GameBoard.getState().flat().every(cell => cell !== null);
  };

  const checkGameOver = () => {
    if (checkForWin()) {
      getCurrentPlayer().incrementScore();
      DisplayController.updateMessage(`${getCurrentPlayer().getName()} won!`);
      DisplayController.updateScoreboard();
      return "win";
    }
    
    if (checkForTie()) {
      DisplayController.updateMessage("It's a tie!");
      return "tie";
    }
    
    return false;
  };

  const nextRound = () => {
    currentRound++;
    DisplayController.updateMessage(`${getCurrentPlayer().getName()}'s turn`);
  };

  const playRound = (row, column) => {
    if (!makeMove(row, column)) return;
    
    const gameResult = checkGameOver();
    
    if (gameResult) {
      gameActive = false;
      DisplayController.removeCellListeners();
      
      setTimeout(() => {
        DisplayController.updateMessage("Resetting the gameboard...");
        togglePlayerOrder();
        GameBoard.reset();
      }, 2000);
      
      setTimeout(() => {
        DisplayController.resetGameBoard();
        DisplayController.updateMessage(`${getCurrentPlayer().getName()}'s turn`);
        DisplayController.addCellListeners();
        gameActive = true;
      }, 4000);
    } else {
      nextRound();
    }
  };

  const togglePlayerOrder = () => {
    if (orderReversed) {
      orderReversed = false;
      currentRound = 0;
    } else {
      orderReversed = true;
      currentRound = 1;
    }
  };

  const resetGame = () => {
    players.length = 0;
    gameActive = false;
    currentRound = 0;
  };

  return { 
    initialize, 
    getCurrentPlayer, 
    getPlayers, 
    playRound,
    resetGame
  };
})();

// DisplayController Module - Handles all UI interactions
const DisplayController = (() => {
  // DOM Elements
  const gameboardElement = document.querySelector(".gameboard");
  const playerOneForm = document.querySelector("#form-one");
  const playerTwoForm = document.querySelector("#form-two");
  const scoreboard = document.querySelector(".scoreboard");
  const instructions = document.querySelector(".instructions");
  const playerOneScore = document.querySelector("#player-score-one");
  const playerTwoScore = document.querySelector("#player-score-two");
  
  // Current color values for players
  let playerOneColor = "red";
  let playerTwoColor = "blue";
  
  // Event handler for cell clicks
  const handleCellClick = (event) => {
    const cell = event.target.closest(".cell");
    if (!cell || !cell.classList.contains("empty")) return;
    
    const row = parseInt(cell.dataset.row);
    const column = parseInt(cell.dataset.column);
    const currentPlayer = GameController.getCurrentPlayer();
    
    const svg = currentPlayer.getMarker() === "x" 
      ? drawX(`var(--marker-color-${currentPlayer.getColor()})`) 
      : drawO(`var(--marker-color-${currentPlayer.getColor()})`);
      
    cell.appendChild(svg);
    cell.classList.add(currentPlayer.getMarker());
    cell.classList.remove("empty");

    GameController.playRound(row, column);
  };

  // Initialize the display
  const initialize = () => {
    createGameBoard();
    setupFormListeners();
    setupMarkerType();
    setMarkerChangeListeners();
    setupColorChangeListeners();
  };
  
  // Create the game board grid cells
  const createGameBoard = () => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "empty");
        cell.setAttribute("data-row", i);
        cell.setAttribute("data-column", j);
        
        gameboardElement.appendChild(cell);
      }
    }
  };
  
  // Listen for cell clicks
  const addCellListeners = () => {
    gameboardElement.addEventListener("click", handleCellClick);
  };

  const removeCellListeners = () => {
    gameboardElement.removeEventListener("click", handleCellClick);
  };

  // Handle color changes on player forms
  const setupColorChangeListeners = () => {
    const h2One = document.querySelector("#player-one h2");
    const h2Two = document.querySelector("#player-two h2");
    const colorOptionsOne = document.querySelector("#player-one .marker-colors");
    const colorOptionsTwo = document.querySelector("#player-two .marker-colors");

    [
      [colorOptionsOne, h2One, playerOneForm], 
      [colorOptionsTwo, h2Two, playerTwoForm]
    ].forEach(([colorGroup, h2, form]) => {
      colorGroup.addEventListener("click", (event) => {
        const option = event.target.closest(".option");
        if (!option) return;
        
        const radioButton = option.querySelector("input");
        const readyButton = form.querySelector(".ready-button");
        if (form.id === "form-one") {
          playerOneColor = radioButton.value;
        } else {
          playerTwoColor = radioButton.value;
        }
        const playerColor = form.id === "form-one" ? playerOneColor : playerTwoColor;
        
        // Update UI with selected color
        h2.style.color = `var(--marker-color-${playerColor})`;
        h2.style.borderColor = `var(--marker-color-${playerColor})`;
        h2.style.setProperty("--box-shadow", `0 0 16px 4px var(--marker-color-${playerColor})`);
        readyButton.style.borderColor = `var(--marker-color-${playerColor})`;
        readyButton.style.boxShadow = `0 0 12px 3px var(--marker-color-${playerColor})`;
      
        const markerTypes = form.querySelector(".marker-types");
        markerTypes.querySelectorAll(".marker-type").forEach(input => {
          input.style.borderColor = `var(--marker-color-${playerColor})`;
          const svg = input.closest(".marker-types .option").querySelector("svg");
          svg.childNodes.forEach(path => {
            path.style.stroke = `var(--marker-color-${playerColor})`;
          });
        });
      });
    });
  };

  // Setup marker type visuals
  const setupMarkerType = () => {
    const options = document.querySelectorAll(".marker-types .option");
    options.forEach(option => {
      const input = option.querySelector(".marker-type");
      const form = option.closest(".player-form");
      const color = form.id.includes("one") ? "red" : "blue"
      const svg = input.classList.contains("x")
        ? drawX(`var(--marker-color-${color})`, 150)
        : drawO(`var(--marker-color-${color})`);
  
      option.append(svg);
    });
  }

  // Handle marker type changes on player forms
  const setMarkerChangeListeners = () => {
    [playerOneForm, playerTwoForm].forEach((form) => {
      const options = form.querySelectorAll(".marker-types .option");
      options.forEach(option => {
        const input = option.querySelector(".marker-type");
        input.addEventListener("change", () => {
          option.querySelector("svg").remove();
          const color = option.closest("form").id === "form-one" ? playerOneColor : playerTwoColor;
          const newSvg = input.classList.contains("x")
            ? drawX(`var(--marker-color-${color})`, 150)
            : drawO(`var(--marker-color-${color})`);
          option.append(newSvg);
        })
      })
    });
  }

  // Handle form submissions
  const setupFormListeners = () => {
    [playerOneForm, playerTwoForm].forEach(form => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.parentElement.classList.add("ready");
        checkBothPlayersReady();
      });
    });
  };

  // Check if both players are ready and start game if they are
  const checkBothPlayersReady = () => {
    const bothReady = [playerOneForm, playerTwoForm].every(form => 
      form.parentElement.classList.contains("ready")
    );
    
    if (bothReady) {
      [playerOneForm, playerTwoForm].forEach(form => {
        setTimeout(() => {
          form.parentElement.classList.add("removed");
          form.parentElement.classList.remove("ready");
        }, 1000);
      });

      const playerOne = Player(
        playerOneForm.elements["player-name"].value,
        playerOneForm.elements["marker-type"].value,
        playerOneForm.elements["marker-color"].value
      );
      
      const playerTwo = Player(
        playerTwoForm.elements["player-name"].value,
        playerTwoForm.elements["marker-type"].value,
        playerTwoForm.elements["marker-color"].value
      );
      
      initializeGame(playerOne, playerTwo);
    }
  };

  // Initialize the game after player setup
  const initializeGame = (playerOne, playerTwo) => {
    GameController.initialize(playerOne, playerTwo);
    addCellListeners();
    setupScoreboard();
    setupInstructions();
  };

  // Draw X marker
  const drawX = (color, timeInterval = 300) => {
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
    setTimeout(() => svg.appendChild(line2), timeInterval);

    return svg;
  };

  // Draw O marker
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
  };
  
  // Setup the scoreboard UI
  const setupScoreboard = () => {
    scoreboard.classList.add("visible");
    
    setTimeout(() => {
      const players = GameController.getPlayers();
      const playerOneName = document.querySelector("#scoreboard-name-one");
      const playerTwoName = document.querySelector("#scoreboard-name-two");
      
      playerOneName.textContent = players[0].getName();
      playerOneName.style.color = `var(--marker-color-${players[0].getColor()})`;
      
      playerTwoName.textContent = players[1].getName();
      playerTwoName.style.color = `var(--marker-color-${players[1].getColor()})`;
  
      playerOneScore.textContent = "0";
      playerOneScore.style.color = `var(--marker-color-${players[0].getColor()})`;
      
      playerTwoScore.textContent = "0";
      playerTwoScore.style.color = `var(--marker-color-${players[1].getColor()})`;
  
      scoreboard.querySelector(".versus").textContent = "VS";
    }, 500);
  };

  // Setup the instructions UI
  const setupInstructions = () => {
    instructions.classList.add("visible");
    
    setTimeout(() => {
      updateMessage(`${GameController.getCurrentPlayer().getName()}'s turn`);
    }, 500);
  };

  // Update the scoreboard with current scores
  const updateScoreboard = () => {
    const players = GameController.getPlayers();
    playerOneScore.textContent = players[0].getScore();
    playerTwoScore.textContent = players[1].getScore();
  };

  // Reset the game board UI
  const resetGameBoard = () => {
    while (gameboardElement.firstChild) {
      gameboardElement.removeChild(gameboardElement.firstChild);
    }
    createGameBoard();
  };

  // Update the message shown in instructions
  const updateMessage = (message) => {
    const player = instructions.querySelector(".turn");
    const messageElement = instructions.querySelector(".message");
    
    if (message.includes("'s turn") || message.includes("won!")) {
      const currentPlayer = GameController.getCurrentPlayer();
      player.textContent = currentPlayer.getName();
      player.style.color = `var(--marker-color-${currentPlayer.getColor()})`;
      
      if (message.includes("won!")) {
        messageElement.lastChild.textContent = " won!";
      } else {
        messageElement.lastChild.textContent = "'s turn";
      }
    } else {
      player.textContent = "";
      messageElement.lastChild.textContent = message;
    }
  };


  return { 
    initialize,
    addCellListeners,
    removeCellListeners,
    updateScoreboard,
    resetGameBoard,
    updateMessage
  };
})();


// Initialize the application
DisplayController.initialize();