//access home page:
//http://localhost:3000/titleScreen 

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set the 'public' folder to serve static files 
app.use(express.static(path.join(__dirname, 'public')));

// Serve titleScreen.html when the root URL is accessed
app.get('/titlescreen', (req, res) => {
    console.log('Serving titleScreen.html');  // Debugging log
    res.sendFile(path.join(__dirname, 'public', 'titleScreen.html'));
});

// Serve index.html for the /multiplayer route
app.get('/game', (req, res) => {
    console.log('Serving game.html for multiplayer');  // Debugging log
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});



// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Store active lobbies
const lobbies = {};

// Generate a unique lobby code
const generateUniqueLobbyCode = () => {
    let code;
    do {
        code = Math.random().toString(36).substr(2, 5).toUpperCase();
    } while (lobbies[code]);
    return code;
};

// Validate that a socket belongs to a lobby
const validatePlayer = (socketId, lobbyCode) => {
    const lobby = lobbies[lobbyCode];
    return lobby && lobby.players.includes(socketId);
};

// Main connection handler
io.on('connection', socket => {
    console.log(`New connection: ${socket.id}`);

    // Create a new lobby
    socket.on('create-lobby', () => {
        const lobbyCode = generateUniqueLobbyCode();
        lobbies[lobbyCode] = { 
            players: [socket.id], 
            ready: [false, false], 
            currentTurn: 0 
        };
        socket.join(lobbyCode);
        socket.emit('lobby-created', lobbyCode);
        console.log(`Lobby ${lobbyCode} created by ${socket.id}`);
    });

    // Join an existing lobby
    socket.on('join-lobby', (lobbyCode) => {
        const lobby = lobbies[lobbyCode];
        if (lobby && lobby.players.length < 2) {
            lobby.players.push(socket.id);
            socket.join(lobbyCode);
            io.to(lobbyCode).emit('player-joined', lobby.players.length);
            console.log(`Player ${socket.id} joined lobby ${lobbyCode}`);
        } else {
            socket.emit('lobby-full-or-not-exist');
            console.log(`Player ${socket.id} attempted to join invalid or full lobby ${lobbyCode}`);
        }
    });

    // Handle player ready
    socket.on('player-ready', () => {
        const playerLobby = Object.keys(lobbies).find(code => validatePlayer(socket.id, code));
        if (playerLobby) {
            const lobby = lobbies[playerLobby];
            const playerIndex = lobby.players.indexOf(socket.id);
            lobby.ready[playerIndex] = true;
            io.to(playerLobby).emit('enemy-ready', playerIndex);

            console.log(`Player ${socket.id} in lobby ${playerLobby} is ready`);

            // Check if both players are ready
            if (lobby.ready.every(status => status)) {
                io.to(playerLobby).emit('both-players-ready');
                console.log(`Both players in lobby ${playerLobby} are ready`);
            }
        }
    });

    // Handle fire
    socket.on('fire', id => {
        const playerLobby = Object.keys(lobbies).find(code => validatePlayer(socket.id, code));
        if (playerLobby) {
            const lobby = lobbies[playerLobby];
            const playerIndex = lobby.players.indexOf(socket.id);

            if (playerIndex === lobby.currentTurn) {
                console.log(`Player ${socket.id} fired on square ${id} in lobby ${playerLobby}`);
                lobby.currentTurn = 1 - playerIndex; // Switch turn
                io.to(playerLobby).emit('update-turn', lobby.currentTurn);
                socket.broadcast.to(playerLobby).emit('fire', id);
            } else {
                socket.emit('not-your-turn');
                console.log(`Player ${socket.id} attempted to fire out of turn in lobby ${playerLobby}`);
            }
        }
    });

    // Handle fire reply
    socket.on('fire-reply', classList => {
        const playerLobby = Object.keys(lobbies).find(code => validatePlayer(socket.id, code));
        if (playerLobby) {
            const otherPlayer = lobbies[playerLobby].players.find(id => id !== socket.id);
            io.to(otherPlayer).emit('fire-reply', classList);
            console.log(`Player ${socket.id} sent fire reply in lobby ${playerLobby}`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        for (const [code, lobby] of Object.entries(lobbies)) {
            const index = lobby.players.indexOf(socket.id);
            if (index !== -1) {
                lobby.players.splice(index, 1);
                lobby.ready.splice(index, 1);
                io.to(code).emit('player-disconnected');
                console.log(`Player ${socket.id} disconnected from lobby ${code}`);

                // If no players left in the lobby, delete it
                if (lobby.players.length === 0) {
                    delete lobbies[code];
                    console.log(`Lobby ${code} deleted`);
                }
                break;
            }
        }
    });
});
