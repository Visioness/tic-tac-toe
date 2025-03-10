function createPlayer(name, marker, color) {
  const getName = () => name;
  const getMarker = () => marker;
  const changeName = (newName) => name = newName;
  const changeColor = (newColor) => color = newColor;
 
  return { getName, getMarker, changeName, changeColor };
}


