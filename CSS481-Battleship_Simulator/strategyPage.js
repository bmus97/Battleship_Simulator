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
  }

  // initalizes ship to be draggable and at starting
  // positions
  function initShip() {
    dragShip(document.getElementById("carrier"));
    dragShip(document.getElementById("battleship"));
    dragShip(document.getElementById("submarine"));
    dragShip(document.getElementById("cruiser"));
    dragShip(document.getElementById("destroyer"));
    const ships = document.getElementsByClassName("ship");
    let initLeft = 130;
    for (let ship of ships) {
      ship.style.left = initLeft + 30 + "px";
      initLeft += 30;
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
    }

    function closeShipDragHandler() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
})();
