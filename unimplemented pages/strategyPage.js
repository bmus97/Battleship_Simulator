/**
 * Javascript for the strategy page where users
 * set their ships on the game grid
 */

"use strict";

(function () {
  window.addEventListener("load", () => {
    initBoard();
    initShip();
  });
  const shipRotateStatus = new Map();

  function initBoard() {
    let board = document.getElementById("grid");
    const boardSize = 10;
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
    board.addEventListener("", () => {});
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
    for (let ship of shipsY) {
      ship.style.left = initLeft + 30 + "px";
      initLeft += 30;
      ship.addEventListener("dblclick", () => {
        rotateShip(ship);
      });
    }
    initLeft = 130;
    for (let ship of shipsX) {
      ship.style.left = initLeft + 30 + "px";
      initLeft += 30;
      ship.classList.add("hide-ship");
      ship.addEventListener("dblclick", () => {
        rotateShip(ship);
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

      document.onmouseup = closeShipDragHandler;
      document.onmousemove = shipDrag;
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

    function closeShipDragHandler() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function rotateShip(ship) {
    let shipId = ship.id;
    ship.classList.add("hide-ship");
    if (shipId.includes("-x")) {
      shipId = shipId.replace("-x", "-y");
      let ship2 = document.getElementById(shipId);
      ship2.classList.remove("hide-ship");
    } else {
      shipId = shipId.replace("-y", "-x");
      let ship2 = document.getElementById(shipId);
      ship2.classList.remove("hide-ship");
    }
  }

  // to  do
  function snapToGrid() {}
})();
