# Battleship  Simulator

## Description
A online Battleship game where users can play single player or multiplayer
with 5 ship types: Carrier, Batteship, Cruiser, Submarine, and Destroyer.
The user wins the game when the enemy ships are all destroyed.
For single player, users play against a bot that randomly shoots the Battleship
grid. For multiplayer, users can join lobbies with lobby codes to play against each other.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [To-do Features Not Yet Implemented](#to-do-features-not-yet-implemented)

## Installation
- First clone the repository by copy and pasting the repository to the git command.
```
git clone https://github.com/bmus97/Battleship_Simulator.git
```
### Prerequisite
- Have Node.js installed to run the game. Here is a link to [how to download Node.js with the packet manager.](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
- Now open up the project folder `BATTLESHIP_SIMULATOR` in your IDE and install the following in your terminal:
```
npm install express
npm install socket.io
```

## Usage
To run the game do the following in the terminal:
```
npm run dev
```
### Opening the Battleship page
Then open up the browser to [localhost:3000](localhost:3000) and the following screen is shown.

![Battleship Title Screen](project_images/battleship_title_screen.jpg?raw=true "Battleship Title Screen")

### Going to the Game Screen
To play click the play button and this will bring you the game screen.

![Battleship Game Screen](project_images/game_screen.jpg?raw=true "Battleship Game Screen")

Here you can click on single player and set up your ships by dragging them to the grid and rotate them by clicking "ROTATE SHIPS" which will rotate all the ships off the grid. (Current Bug: where ships can be placed on top of each other)
### Rotate Ships
![Battleship Rotate Ships](project_images/battleship_rotate.jpg?raw=true "Battleship Rotate Ships")
### Setting Ships
![Battleship Game Ready Single](project_images/battleship_single_ready.jpg?raw=true "Battleship Game Ready Single")

### Starting Single Player
Once all the ships have been set click on start to play single player against a
bot. Now user can click on the enemy grid and shoot at the enemy's ships on their turn. Red shows a hit on a ship and black shows a miss.

![Battleship Playing Single Player](project_images/playing_single_player.jpg?raw=true "Battleship Playing Single Player")

### Starting Multiplayer
For multiplayer, the user can host a lobby by after clicking multiplayer can click on "CREATE LOBBY" and copy and paste the lobby code at the top of the screen to send to another player. In the screenshot below the is "NOMRR".

![Hosting Battleship Game](project_images/host_game.jpg?raw=true "Hosting Battleship Game")

### Joining a Lobby
To join the lobby another user hosted, the user first clicks on multiplayer and pastes in to the input text box the lobby code. For this example, the lobby code is "NOMRR" from above. Then click on "JOIN LOBBY" at the top of the screen.

![Joining Battleship Game](project_images/joining_game.jpg?raw=true "Joining Battleship Game")

### Playing Multiplayer
After joining the lobby both players have to set their ships and press start to ready for the game to begin. Once that is done the game has begun and the first turn of the game goes to the host of the lobby. Like single player the game functions the same with each turn a player can shoot the opposing grid on the right where red shows a hit on a ship and black meaning a shot miss. (Current Bug: where it shows both players that is their turn and the indicators above the grid are not displaying the correctly as green and ships can be placed on each other)

![Playing Multiplayer](project_images/playing_multiplayer.jpg?raw=true "Joining Battleship Game")

## To-Do Features Not Yet Implemented
Currently, here are the list of features we were not able to implement in time:
- User accounts
- User sign in
- Create profile
- Profile screen
- Customized Game settings
- Friends List
- Invite list
- Adding friends
- Finding online games
- Strategy setup page
- Chat popup 



