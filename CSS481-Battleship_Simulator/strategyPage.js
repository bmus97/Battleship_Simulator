/**
 * Javascript for the strategy page where users
 * set their ships on the game grid
 */

"use strict";

(function () {
  window.addEventListener("load", () => {
    initBoard();
    initShip();
    initStart();
    initReset();
  });

  // map for all the ship instances and their info
  // ex. [carrier, horizontal: false, coords: [0,0], length: 5]
  const shipData = new Map();
  // 2d array representation of the game grid
  // print function at the end to show how grid looks
  const gridRep = [];
  const boardSize = 10;

  function initBoard() {
    let board = document.getElementById("grid");
    for (let i = 0; i < boardSize; i++) {
      // let column = document.createElement("div");
      // column.classList.add("grid-column");
      let row = document.createElement("div");
      row.classList.add("grid-row");
      for (let j = 0; j < boardSize; j++) {
        let cell = document.createElement("div");
        let cellDot = document.createElement("div");
        cellDot.classList.add("grid-dot");
        cell.classList.add("grid-cell");
        cell.appendChild(cellDot);
        row.appendChild(cell);
        // column.appendChild(row);
      }
      board.appendChild(row);
    }
    initGridRep();
  }

  function initGridRep() {
    for (let i = 0; i < boardSize; i++) {
      gridRep[i] = [];
      for (let j = 0; j < boardSize; j++) {
        gridRep[i][j] = false;
      }
    }
  }

  function initStart() {}

  function initReset() {
    const resetBtn = document.getElementById("reset-button");
    resetBtn.addEventListener("click", () => {
      const shipsY = document.getElementsByClassName("ship-y");
      const shipsX = document.getElementsByClassName("ship-x");
      let initLeft = 130;
      let initTop = 180;
      // move ships back to orginial positions
      // and resets the map for the ships
      for (let i = 0; i < shipsY.length; i++) {
        shipsY[i].style.left = initLeft + 30 + "px";
        shipsX[i].style.left = initLeft + 30 + "px";
        shipsY[i].style.top = initTop + "px";
        shipsX[i].style.top = initTop + "px";
        initLeft += 30;
        shipsX[i].classList.add("hide-ship");
        shipsY[i].classList.remove("hide-ship");
        let numDots = shipsY[i].getElementsByClassName("ship-cell");
        let length = numDots.length;
        let shipKey = shipsY[i].id.replace("-y", "");
        shipData.set(shipKey, {
          horizontal: false,
          coords: [],
          length: length,
        });
        console.log(shipsY[i].offsetTop);
      }

      // clears the 2d game grid
      initGridRep();
    });
  }

  // initalizes ship to be draggable and at starting
  // positions
  function initShip() {
    dragShip(document.getElementById("carrier-y"));
    dragShip(document.getElementById("carrier-x"));
    dragShip(document.getElementById("battleship-y"));
    dragShip(document.getElementById("battleship-x"));
    dragShip(document.getElementById("submarine-y"));
    dragShip(document.getElementById("submarine-x"));
    dragShip(document.getElementById("cruiser-y"));
    dragShip(document.getElementById("cruiser-x"));
    dragShip(document.getElementById("destroyer-y"));
    dragShip(document.getElementById("destroyer-x"));
    const shipsY = document.getElementsByClassName("ship-y");
    const shipsX = document.getElementsByClassName("ship-x");
    let initLeft = 130;
    let initTop = 180;
    for (let i = 0; i < shipsY.length; i++) {
      shipsY[i].style.left = initLeft + 30 + "px";
      shipsX[i].style.left = initLeft + 30 + "px";
      shipsY[i].style.top = initTop + "px";
      shipsX[i].style.top = initTop + "px";
      initLeft += 30;
      shipsX[i].classList.add("hide-ship");
      shipsY[i].addEventListener("dblclick", (e) => {
        removeShipSpace(e);
        rotateShip(shipsY[i]);
      });
      shipsX[i].addEventListener("dblclick", (e) => {
        removeShipSpace(e);
        rotateShip(shipsX[i]);
      });
      let numDots = shipsY[i].getElementsByClassName("ship-cell");
      let length = numDots.length;
      let shipKey = shipsY[i].id.replace("-y", "");
      shipData.set(shipKey, {
        horizontal: false,
        coords: [],
        length: length,
      });
    }
  }

  // takes in given ship and makes it draggable
  function dragShip(ship) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (ship) {
      ship.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      // remove ship coordinates to reset for position

      removeShipSpace(e);
      document.onmousemove = shipDrag;
      ship.onmouseup = closeShipDragHandler;
    }

    function shipDrag(e) {
      e = e || window.event;
      e.preventDefault();

      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;

      pos3 = e.clientX;
      pos4 = e.clientY;

      let newTop = ship.offsetTop - pos2;
      let newLeft = ship.offsetLeft - pos1;
      ship.style.top = newTop + "px";
      ship.style.left = newLeft + "px";
      let shipId = ship.id;
      if (shipId.includes("-x")) {
        shipId = shipId.replace("-x", "-y");
        let ship2 = document.getElementById(shipId);
        ship2.style.top = newTop + "px";
        ship2.style.left = newLeft + "px";
      } else {
        shipId = shipId.replace("-y", "-x");
        let ship2 = document.getElementById(shipId);
        ship2.style.top = newTop + "px";
        ship2.style.left = newLeft + "px";
      }
    }

    function closeShipDragHandler(e) {
      document.onmouseup = null;
      document.onmousemove = null;
      checkPosition(e);
    }
  }

  // rotates the ship to 90 degrees
  function rotateShip(ship) {
    let shipId = ship.id;
    ship.classList.add("hide-ship");
    if (shipId.includes("-x")) {
      let shipKey = shipId.replace("-x", "");

      shipId = shipId.replace("-x", "-y");
      let ship2 = document.getElementById(shipId);
      ship2.classList.remove("hide-ship");

      let shipUpdate = shipData.get(shipKey);
      shipUpdate.horizontal = false;
      shipData.set(shipKey, shipUpdate);
    } else {
      let shipKey = shipId.replace("-y", "");

      shipId = shipId.replace("-y", "-x");
      let ship2 = document.getElementById(shipId);
      ship2.classList.remove("hide-ship");

      let shipUpdate = shipData.get(shipKey);
      shipUpdate.horizontal = true;
      shipData.set(shipKey, shipUpdate);
    }
  }

  // checks the position of the ship and calcluates
  // where it is dropped onto the grid
  function checkPosition(e) {
    e.preventDefault();
    const ship = e.target.parentNode;
    // calculates the coordinate of the ship on the grid
    calcCoords(ship);
  }

  // calculates the coordinate of the ship on the grid
  // based on its orientation and size then places
  // the ship onto the grid
  function calcCoords(ship) {
    let gridXOffset = grid.offsetLeft;
    let gridYOffset = grid.offsetTop;
    let cellWidth = grid.offsetWidth / boardSize;
    let gridXOrigin = gridXOffset - gridXOffset;
    let gridYOrigin = gridYOffset - gridYOffset;

    const dashIndex = ship.id.indexOf("-");
    const shipKey = ship.id.substring(0, dashIndex);

    let shipX = ship.offsetLeft - gridXOffset;
    let shipY = ship.offsetTop - gridYOffset;

    let shipGridPosX = Math.floor(shipX / cellWidth);
    let shipGridPosY = Math.floor(shipY / cellWidth);

    let shipInfo = shipData.get(shipKey);

    if (shipGridPosX >= gridXOrigin && shipGridPosY >= gridYOrigin) {
      if (checkCells(shipGridPosX, shipGridPosY, shipInfo)) {
        let shipUpdate = shipData.get(shipKey);
        shipUpdate.coords = [shipGridPosX, shipGridPosY];
        shipData.set(shipKey, shipUpdate);
        fillCells(shipUpdate, true);
        snapToGrid(shipUpdate, gridXOffset, gridYOffset, cellWidth, ship);
        console.log("check set");
        printBoolGrid();
      }
    }
  }

  // checks the cells if a ship can occpuy the space
  // on the board
  function checkCells(shipX, shipY, shipInfo) {
    for (let i = 0; i < shipInfo.length; i++) {
      let cellX = shipX,
        cellY = shipY;
      if (shipInfo.horizontal) {
        cellX += i;
      } else {
        cellY += i;
      }
      if (gridRep[cellX][cellY]) {
        return false;
      }
    }
    return true;
  }

  // fills the 2d grid array with the correct
  // status; true is when space is occupied and
  // false is when space is empty
  function fillCells(shipInfo, fillStatus) {
    for (let i = 0; i < shipInfo.length; i++) {
      let cellX = shipInfo.coords[0],
        cellY = shipInfo.coords[1];
      if (shipInfo.horizontal) {
        cellX += i;
      } else {
        cellY += i;
      }
      if (fillStatus) {
        gridRep[cellX][cellY] = true;
      } else {
        gridRep[cellX][cellY] = false;
      }
    }
  }

  // snaps the ship into the correct place on the screen
  // according to the grid offset saved from the screen
  function snapToGrid(shipInfo, xOffset, yOffset, cellWidth, ship) {
    if (shipInfo.horizontal) {
      yOffset += cellWidth / 6;
      xOffset += 2;
    } else {
      xOffset += cellWidth / 6;
      yOffset += 2;
    }
    let posX = shipInfo.coords[0] * cellWidth + xOffset;
    let posY = shipInfo.coords[1] * cellWidth + yOffset;

    ship.style.left = posX + "px";
    ship.style.top = posY + "px";
  }

  // removes the spaces from the grid
  // and the saved coordinates the ship occupied whenever
  // the ship is lifted or rotated
  function removeShipSpace(e) {
    e.preventDefault();
    const ship = e.target.parentNode;
    const dashIndex = ship.id.indexOf("-");
    const shipKey = ship.id.substring(0, dashIndex);
    let shipRemove = shipData.get(shipKey);
    if (shipRemove.coords.length > 0) {
      fillCells(shipRemove, false);
      //  remove the coords from the ship in map
      shipRemove.coords = [];
      shipData.set(shipKey, shipRemove);
    }
    console.log("remove check");
    printBoolGrid();
  }

  function printBoolGrid() {
    for (let y = 0; y < boardSize; y++) {
      let row = y + ": ";
      for (let x = 0; x < boardSize; x++) {
        if (gridRep[x][y]) {
          row += " X ";
        } else {
          row += " O ";
        }
      }
      console.log(row);
    }
  }
})();
