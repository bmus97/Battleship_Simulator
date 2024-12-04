/*
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Store active lobbies
const lobbies = {};

io.on('connection', socket => {
    console.log('New WS Connection');

    // Create a new lobby
    socket.on('create-lobby', () => {
        const lobbyCode = Math.random().toString(36).substr(2, 5);
        lobbies[lobbyCode] = { players: [socket.id], ready: [false, false] };
        socket.join(lobbyCode);
        socket.emit('lobby-created', lobbyCode);
        console.log(`Lobby ${lobbyCode} created`);
    });

    // Join an existing lobby
    socket.on('join-lobby', (lobbyCode) => {
        if (lobbies[lobbyCode] && lobbies[lobbyCode].players.length < 2) {
            lobbies[lobbyCode].players.push(socket.id);
            socket.join(lobbyCode);
            io.to(lobbyCode).emit('player-joined', lobbies[lobbyCode].players.length);
            console.log(`Player joined lobby ${lobbyCode}`);
        } else {
            socket.emit('lobby-full-or-not-exist');
        }
    });

    // On player ready
    socket.on('player-ready', () => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            const playerIndex = lobbies[playerLobby].players.indexOf(socket.id);
            lobbies[playerLobby].ready[playerIndex] = true;
            io.to(playerLobby).emit('enemy-ready', playerIndex);

            // Check if both players are ready
            if (lobbies[playerLobby].ready.every(status => status)) {
                io.to(playerLobby).emit('both-players-ready');
            }
        }
    });

    socket.on('fire', id => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            socket.broadcast.to(playerLobby).emit('fire', id);
        }
    });
    
    socket.on('fire-reply', classList => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            socket.broadcast.to(playerLobby).emit('fire-reply', classList);
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
                if (lobby.players.length === 0) delete lobbies[code];
                break;
            }
        }
    });

}); */

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Store active lobbies
const lobbies = {};

io.on('connection', socket => {
    console.log('New WS Connection');

    // Create a new lobby
    socket.on('create-lobby', () => {
        const lobbyCode = Math.random().toString(36).substr(2, 5); // Generate a 5-character code
        lobbies[lobbyCode] = { players: [socket.id], ready: [false, false] };
        socket.join(lobbyCode);
        socket.emit('lobby-created', lobbyCode);
        console.log(`Lobby ${lobbyCode} created`);
    });

    // Join an existing lobby
    socket.on('join-lobby', (lobbyCode) => {
        if (lobbies[lobbyCode] && lobbies[lobbyCode].players.length < 2) {
            lobbies[lobbyCode].players.push(socket.id);
            socket.join(lobbyCode);
            io.to(lobbyCode).emit('player-joined', lobbies[lobbyCode].players.length);
            console.log(`Player joined lobby ${lobbyCode}`);
        } else {
            socket.emit('lobby-full-or-not-exist');
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
                if (lobby.players.length === 0) delete lobbies[code];
                break;
            }
        }
    });

    // On player ready
    socket.on('player-ready', () => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            const playerIndex = lobbies[playerLobby].players.indexOf(socket.id);
            lobbies[playerLobby].ready[playerIndex] = true;
            io.to(playerLobby).emit('enemy-ready', playerIndex);

            // Check if both players are ready
            if (lobbies[playerLobby].ready.every(status => status)) {
                io.to(playerLobby).emit('both-players-ready');
            }
        }
    });

    // On fire received
    socket.on('fire', id => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            socket.broadcast.to(playerLobby).emit('fire', id);
        }
    });

    // On fire reply
    socket.on('fire-reply', classList => {
        const playerLobby = Object.keys(lobbies).find(code => lobbies[code].players.includes(socket.id));
        if (playerLobby) {
            socket.broadcast.to(playerLobby).emit('fire-reply', classList);
        }
    });
});