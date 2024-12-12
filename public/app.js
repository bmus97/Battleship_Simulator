document.addEventListener('DOMContentLoaded', () => {

  // acquire necessary html elements 
  const userGrid = document.querySelector('.grid-user');
  const computerGrid = document.querySelector('.grid-computer');
  const displayGrid = document.querySelector('.grid-display');
  const ships = document.querySelectorAll('.ship');
  const destroyer = document.querySelector('.destroyer-container');
  const submarine = document.querySelector('.submarine-container');
  const cruiser = document.querySelector('.cruiser-container');
  const battleship = document.querySelector('.battleship-container');
  const carrier = document.querySelector('.carrier-container');
  const startButton = document.querySelector('#start');
  const rotateButton = document.querySelector('#rotate');
  const turnDisplay = document.querySelector('#whose-go');
  const infoDisplay = document.querySelector('#info');
  const singlePlayerButton = document.querySelector('#singlePlayerButton');
  const multiPlayerButton = document.querySelector('#multiPlayerButton');
  const createLobbyButton = document.querySelector('#createLobbyButton');
  const joinLobbyButton = document.querySelector('#joinLobbyButton');
  const lobbyCodeInput = document.querySelector('#lobbyCodeInput');
  const lobbyCodeDisplay = document.querySelector('#lobbyCodeDisplay');

  const userSquares = []; // Array to store user squares
  const computerSquares = []; // Array to store computer squares
  
  let isHorizontal = true; // Variable to store current ship orientation
  let isGameOver = false; // track if game is over
  let currentPlayer = 'user'; // track current player (user or enemy)
  
  const width = 10; // Width of the grid
  
  let gameMode = ""; // Track the game mode (single or multi player)
  let playerNum = 0; // Track the player number
  let ready = false; // Track if player is ready
  let enemyReady = false; // Track if enemy is ready
  let allShipsPlaced = false; // Track if all ships are placed
  let shotFired = -1; // Track the last shot fired

  // Select Player Mode
  singlePlayerButton.addEventListener('click', startSinglePlayer);
  multiPlayerButton.addEventListener('click', startMultiPlayer);

  // Multiplayer
  function startMultiPlayer() {

    console.log("startMultiPlayer Called - app.js"); // Debugging Statement
    startButton.disabled = false; 

    //display multiplayer related content
    document.getElementById('createLobbyButton').style.display = 'block';
    document.getElementById('joinLobbyButton').style.display = 'block';
    document.getElementById('lobbyCodeInput').style.display = 'block';

    // Select the button and hide it
    const singlePlayerButton = document.getElementById('singlePlayerButton');
    singlePlayerButton.style.display = 'none'; // Completely remove from layout

    // Select the button and hide it
    const multiPlayerButton = document.getElementById('multiPlayerButton');
    multiPlayerButton.style.display = 'none'; // Completely remove from layout

      gameMode = 'multiPlayer';
      const socket = io();   // Create a new socket connection
  
      // Create a new lobby
      createLobbyButton.addEventListener('click', () => {
          socket.emit('create-lobby');
          createLobbyButton.style.display = 'none'; // Completely remove from layout
          joinLobbyButton.style.display = 'none'; // Completely remove from
          lobbyCodeInput.style.display = 'none'; // Completely remove from layout
      });
  
      // Join an existing lobby
      joinLobbyButton.addEventListener('click', () => {
          const lobbyCode = lobbyCodeInput.value.trim();
          if (lobbyCode) {
              socket.emit('join-lobby', lobbyCode);
              createLobbyButton.style.display = 'none'; // Completely remove from layout
              joinLobbyButton.style.display = 'none'; // Completely remove from
              lobbyCodeInput.style.display = 'none'; // Completely remove from layout
          }
      });
  
      // Display created lobby code
      socket.on('lobby-created', (lobbyCode) => {
          lobbyCodeDisplay.innerHTML = `Lobby Code: ${lobbyCode}`;
          infoDisplay.innerHTML = "Share this code with a friend to join the game.";
      });
  
      // Handle joining a lobby
      socket.on('player-joined', (playerCount) => {
        lobbyCodeDisplay.style.display = 'none'; // Completely remove from layout
          infoDisplay.innerHTML = `Player ${playerCount} has joined the lobby.`;

      });
  
      // Handle full or non-existent lobbies
      socket.on('lobby-full-or-not-exist', () => {
          infoDisplay.innerHTML = 'Lobby is full or does not exist.';
      });
  
      // Get your player number
      socket.on('player-number', num => {
          if (num === -1) {
              infoDisplay.innerHTML = "Sorry, the server is full";
          } else {
              playerNum = parseInt(num);
              if (playerNum === 1) currentPlayer = "enemy";
              console.log(playerNum);
  
              // Get other player status
              socket.emit('check-players');
          }
      });
  
      // Another player has connected or disconnected
      socket.on('player-connection', num => {
          console.log(`Player number ${num} has connected or disconnected`);
          playerConnectedOrDisconnected(num);
      });
  
      // On enemy ready
      socket.on('enemy-ready', num => {
          enemyReady = true;
          playerReady(num);
          if (ready) playGameMulti(socket);
      });
  
      // Check player status
      socket.on('check-players', players => {
          players.forEach((p, i) => {
              if (p.connected) playerConnectedOrDisconnected(i);
              if (p.ready) {
                  playerReady(i);
                  if (i !== playerReady) enemyReady = true;
              }
          });
      });
  
      // On Timeout
      socket.on('timeout', () => {
          infoDisplay.innerHTML = 'You have reached the 10 minute limit';
      });
  
      // Ready button click
      startButton.addEventListener('click', () => {
          if (allShipsPlaced) {
              socket.emit('player-ready');
              ready = true;
              playerReady(playerNum);
              //get rid of start game button
              startButton.style.display = 'none'; // Completely remove from layout
              rotateButton.style.display = 'none'; // Completely remove from layout
              if (enemyReady) playGameMulti(socket);
          } else {
              infoDisplay.innerHTML = "Please place all ships";
          }
      });
  
      // Setup event listeners for firing
      computerSquares.forEach(square => {
          square.addEventListener('click', handleFire);
      });
  
      // Handle firing
      function handleFire(e) {
          const square = e.target;
          console.log("Fired by:", currentPlayer);

          // Only allow firing if it's the user's turn and both players are ready
          if (currentPlayer === 'user' && ready && enemyReady) {
              shotFired = square.dataset.id;
              console.log(shotFired);
              socket.emit('fire', shotFired);
          } else {
              infoDisplay.innerHTML = "Both players must be ready before firing.";
          }
      }
  
      // On Fire Received
      socket.on('fire', id => {
          console.log("Received fire:", id);
          enemyGo(id);  // Handle the enemy's move
          const square = userSquares[id];
          console.log("recieve fire listt", square.classList)
          socket.emit('fire-reply', square.classList);  // Send back the result of the shot
          console.log(square.classList)
          playGameMulti(socket);  // Update game state for the next turn
      });
  
      // On Fire Reply Received
      socket.on('fire-reply', classList => {
          console.log("Received fire-reply:", classList);
          revealSquare(classList);  // Reveal the result of your shot
          currentPlayer = currentPlayer === 'user' ? 'enemy' : 'user';  // Toggle current player
          playGameMulti(socket);  // Update game state for the next turn
      });

      //activates blocks on enemy board to fire once its your turn
      function playGameMulti(socket) {
          if (isGameOver) return;
  
          if (!ready) return;  // Ensure both players are ready
  
          if (enemyReady && ready) {
              if (currentPlayer === 'user') {
                  turnDisplay.innerHTML = 'Your Go';
                  computerSquares.forEach(square => square.addEventListener('click', handleFire));
              } else {
                  turnDisplay.innerHTML = "Enemy's Go";
                  computerSquares.forEach(square => square.removeEventListener('click', handleFire));
              }
          }
      }
  
      //update player status if they disconnect
      function playerConnectedOrDisconnected(num) {
          let playerClassName = `.p${parseInt(num) + 1}`;
          let playerElement = document.querySelector(`${playerClassName} .connected span`);
          
          if (playerElement) {
              playerElement.classList.toggle('green');
              if (parseInt(num) === playerNum) document.querySelector(playerClassName).style.fontWeight = 'bold';
          } else {
              console.error(`Element for player ${num} connection status not found.`);
          }
      }
      
      //update player status element to show if they are ready
      function playerReady(num) {
          let playerClassName = `.p${parseInt(num) + 1}`;
          let playerElement = document.querySelector(`${playerClassName} .ready span`);
          
          if (playerElement) {
              playerElement.classList.toggle('green');
          } else {
              console.error(`Element for player ${num} readiness not found.`);
          }
      }
  }
  

  // Single Player
  function startSinglePlayer() {
    gameMode = "singlePlayer"

    //enable start button
    startButton.disabled = false; 

    // Select the button and hide it
    const singlePlayerButton = document.getElementById('singlePlayerButton');
    singlePlayerButton.style.display = 'none'; // Completely remove from layout

    // Select the multiplayer button and hide it
    const multiPlayerButton = document.getElementById('multiPlayerButton');
    multiPlayerButton.style.display = 'none'; // Completely remove from layout

    //hide create lobby button
    const createLobbyButton = document.getElementById('createLobbyButton');
    createLobbyButton.style.display = 'none'; // Completely remove from layout

    //hide join lobby code button
    const joinLobbyButton = document.getElementById('joinLobbyButton');
    joinLobbyButton.style.display = 'none'; // Completely remove from layout

    //hide join lobby button
    const lobbyCodeInput = document.getElementById('lobbyCodeInput');
    lobbyCodeInput.style.display = 'none'; // Completely remove from layout

    // Select the div with class "player p2"
    const playerP1Div = document.querySelector('.player.p1');

    // Remove all child elements
    while (playerP1Div.firstChild) {
        playerP1Div.removeChild(playerP1Div.firstChild);
    }

    // Set the text content to "Player"
    playerP1Div.textContent = 'Player';
    playerP1Div.style.color = 'lime';
    playerP1Div.style.fontSize = '50px';
    playerP1Div.style.marginLeft = '-55px';

    // Select the div with class "player p2"
    const playerP2Div = document.querySelector('.player.p2');

    // Remove all child elements
    while (playerP2Div.firstChild) {
        playerP2Div.removeChild(playerP2Div.firstChild);
    }

    // Set the text content to "Bot"
    playerP2Div.textContent = 'Bot';
    playerP2Div.style.color = 'lime';
    playerP2Div.style.fontSize = '50px';
    playerP1Div.style.marginRight = '-60px';


    //place enemy ships randomly
    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[2])
    generate(shipArray[3])
    generate(shipArray[4])

    //sets the start button to play single player
    startButton.addEventListener('click', playGameSingle)
    
  }

  //Create Board
  function createBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }
  createBoard(userGrid, userSquares)
  createBoard(computerGrid, computerSquares)

  //Ships
  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0, 1],
        [0, width]
      ]
    },
    {
      name: 'submarine',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'cruiser',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'battleship',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'carrier',
      directions: [
        [0, 1, 2, 3, 4],
        [0, width, width*2, width*3, width*4]
      ]
    },
  ]

  //Draw the computers ships in random locations
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length); //picks random direction for ship
    let current = ship.directions[randomDirection];
    let direction = randomDirection === 0 ? 1 : width;

    let validPlacement = false;
    let randomStart;

    //checks if ship placement is valid on game board ie, entire length of ship is on the board
    while (!validPlacement) {
      randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)));

      const isTaken = current.some(index => computerSquares[randomStart + index]?.classList.contains('taken'));
      const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1);
      const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0);

      if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
        validPlacement = true;
      }
    }

    current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name));
    current.forEach(index => computerSquares[randomStart + index].classList.add('hide'));
  }
  

  //Rotate the ships if rotate ships button is pressed
  function rotate() {
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = false
      // console.log(isHorizontal)
      return
    }
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = true
      // console.log(isHorizontal)
      return
    }
  }
  rotateButton.addEventListener('click', rotate)

  //move around user ship
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))
  userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
     console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
     console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
     console.log('drag leave')
  }

  function dragDrop() {
    let shipNameWithLastId = draggedShip.lastChild.id
    let shipClass = shipNameWithLastId.slice(0, -2)
     console.log(shipClass)
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)
     console.log(shipLastId)
    const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
    const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
    
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
    let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex
    // console.log(shipLastId)

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass)
      }
    //As long as the index of the ship you are dragging is not in the newNotAllowedVertical array! This means that sometimes if you drag the ship by its
    //index-1 , index-2 and so on, the ship will rebound back to the displayGrid.
    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', shipClass)
      }
    } else return

    displayGrid.removeChild(draggedShip)
    if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
  }

  function dragEnd() {
     console.log('dragend')
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready span`).classList.toggle('green')
  }

  // Game Logic for Single Player
  function playGameSingle() {
    startButton.style.display = 'none'; // Completely remove from layout
    rotateButton.style.display = 'none'; // Completely remove from layout
    if (isGameOver) return
    if (currentPlayer === 'user') {
      turnDisplay.innerHTML = 'Your Go'
      computerSquares.forEach(square => square.addEventListener('click', function(e) {
        shotFired = square.dataset.id
        revealSquare(square.classList)
      }))
    }
    if (currentPlayer === 'enemy') {
      turnDisplay.innerHTML = 'Computers Go'
      setTimeout(enemyGo, 1000)
    }
  }

  //variables to keep track of how much of each ship is sunk
  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0
  let carrierCount = 0

  //Reveal the square that was clicked
  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`);
    const obj = Object.values(classList);
    console.log("in reveal" , classList)

    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
      console.log("in no boom " , classList)

      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battleship')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++
    }
    if (obj.includes('taken')) {
      console.log("before boom " , classList)
      enemySquare.classList.add('boom')
      enemySquare.classList.remove('hide')
      console.log("after boom " , classList)

    } else {
      console.log("in miss " , classList)
      enemySquare.classList.add('miss')
    }
    console.log("outside " , classList)

    checkForWins()
    currentPlayer = 'enemy'
    if(gameMode === 'singlePlayer') playGameSingle()
  }

  let cpuDestroyerCount = 0
  let cpuSubmarineCount = 0
  let cpuCruiserCount = 0
  let cpuBattleshipCount = 0
  let cpuCarrierCount = 0


  //enemies turn to fire
  function enemyGo(square) {
    if (gameMode === 'singlePlayer') square = Math.floor(Math.random() * userSquares.length) //pick random square if cpu is playing
    if (!userSquares[square].classList.contains('boom')) {
      if (userSquares[square].classList.contains('taken')) {
        userSquares[square].classList.add('boom')
      } else {
        userSquares[square].classList.add('miss')
      }
      if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++
      if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
      if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
      if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++
      if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
      checkForWins()
    } else if (gameMode === 'singlePlayer') enemyGo()
    currentPlayer = 'user'
    turnDisplay.innerHTML = 'Your Go'
  }

  //checks if all ships of a player are sunk
  //if an entire ship is sunk, display message notifying that ship is sunk
  function checkForWins() {
    console.log("in check for wins");
    let enemy = 'computer'
    if(gameMode === 'multiPlayer') enemy = 'enemy'
    if (destroyerCount === 2) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
      destroyerCount = 10
    }
    if (submarineCount === 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
      submarineCount = 10
    }
    if (cruiserCount === 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`
      cruiserCount = 10
    }
    if (battleshipCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`
      battleshipCount = 10
    }
    if (carrierCount === 5) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s carrier`
      carrierCount = 10
    }
    if (cpuDestroyerCount === 2) {
      infoDisplay.innerHTML = `${enemy} sunk your destroyer`
      cpuDestroyerCount = 10
    }
    if (cpuSubmarineCount === 3) {
      infoDisplay.innerHTML = `${enemy} sunk your submarine`
      cpuSubmarineCount = 10
    }
    if (cpuCruiserCount === 3) {
      infoDisplay.innerHTML = `${enemy} sunk your cruiser`
      cpuCruiserCount = 10
    }
    if (cpuBattleshipCount === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your battleship`
      cpuBattleshipCount = 10
    }
    if (cpuCarrierCount === 5) {
      infoDisplay.innerHTML = `${enemy} sunk your carrier`
      cpuCarrierCount = 10
    }
    console.log(destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount);
    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
      infoDisplay.innerHTML = "YOU WIN"
      gameOver()
    }
    if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
  }

  //disable game and show play again button
  function gameOver() {
    console.log("game over");
    isGameOver = true
    startButton.removeEventListener('click', playGameSingle)
    document.getElementById('play-again').style.display = 'block'
  }
  
}); 
