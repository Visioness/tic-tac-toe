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
    for(let i = 0; i < 3; i++) {
      const row = [];
      for(let j = 0; j < 3; j++) {
        row.push("null");
      }
      board.push(row);
    }
  }

  const clear = () => {
  }
  
  const move = (player, row, column) => board[row][column] = player.marker; 

  return { create, currentState, clear, move };
})();


