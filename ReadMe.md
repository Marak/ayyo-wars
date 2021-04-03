# Alien Warz

Alien Warz is an open-source and hackable 2d starship asteroids like space battle game. It's built with Phaser.io and Node.js. It can be played in browser.

## Home Page

[https://alienwarz.com](https://alienwarz.com)

## About

This repository is a fresh port of a project which has been in development for several years. We have the following game elements designed and planned for our Beta release:

 - 12 Unique Ships
 - 24 Unique Weapons
 - 5 Unique Levels
 - 4 Game Modes

## Game Modes

### Local Skirmish ( beta )

Two teams of ships battle each other until no ships are left. Can be played with two players or against an Artifical Intelligence.

### Online Skirmish ( alpha )

Select a team of ships and direct connect to a friend to battle. Uses WebRTC and UDP.

### Surival ( planned )

Choose a ship and battle Waves of enemies until you reach the end or die trying.

### Game Editor ( planned )

Create and modify all game behaviors including ships, weapons, items, and levels. Currently only supports level editing.

### Galaxy Mode ( planned )

Explore the galaxy in a space ship. Build bases. Gather resources. Battle aliens. Defend and conquer territories.

## Local Installation

    git clone https://github.com/Marak/alien-wars
    cd alien-warz
    npm install
    npm start

This will start the game. You should then be able to open `http://localhost:3000` in your browser.

## Local Development

**Start development server**

    npm run dev
    
## Game Architecture

### Behaviors

Alien Wars utilizes a Behavior based system dependency injection pattern where every game object starts as an empty sprite which can have behaviors "attached" to it. Think of it as a [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science)) approach instead of [object inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)) for defining game objects and behaviors.

Ships or other game objects are collections of behaviors each of which acts on the sprite on every update of the game loop.

These behaviors control how the sprite will act. 

See current behaviors here: [https://github.com/Marak/alien-warz/tree/master/lib/behaviors](https://github.com/Marak/alien-warz/tree/master/lib/behaviors)

### Audio and Image Assets

Game audio and images are stored here: 

Any image or sound can be modified or replaced in the game. Simply search for the asset you want to modify and open it with your favorite editing application.

New assets can also be put into this folder, but you will need to be sure to register and load them using `loadAsset`  function.

### Online Mode

*Online Protocols*

Alien Warz supports multiplayer through the use of an authoratitive server which runs all game calculations. Each client connects using UDP and Webrtc to create a direct peer connection to the server. Websockets are also used as a signaling server for the WebRTC connections.

Client Prediction / Lag Compensation / Snapshot Interpolation

Through the use of the [https://github.com/geckosio/snapshot-interpolation](snapshot-interpolation) library, Alien Warz is able to perform client-side prediction for all game object movement and then reconcile those objects against the server state. In online mode all clients broadcast their inputs to the authortative server, which then sends back the actual server-side calculated positions to the client which adjusts them based the snapshot state differential.

## Modifying Game Contents

### Creating a new Level

1. Find a level in `./lib/behaviors/levels/` and copy the code
2. Take that code and create new Behavior at `./lib/behaviors/levels/isMyLevel.js`
3. Add a new entry in `./lib/index.js` which requires the new level
4. Make sure the project rebuilds
5. The level should now be available in the Game Editor mode, Levels drop down


### Creating a new Ship

1. Find a ship in `./lib/behaviors/ships/` and copy the code
2. Take that code and create new Behavior at `./lib/behaviors/ships/isMyShip.js`
3. Add a new entry in `./lib/index.js` which requires the new Ship
4. Make sure the project rebuilds
5. The ship should now be available in the Game Editor mode, Behaviors drop down
6. The new ship can also be added to a Faction in `./lib/index.js`

### Creating a new Weapon

1. Find a weapon in `./lib/behaviors/weapons/` and copy the code
2. Take that code and create new Behavior at `./lib/behaviors/weapons/hasMyWeapon.js`
3. Add a new entry in `./lib/index.js` which requires the new Weapon
4. Make sure the project rebuilds
5. The weapon should now be available in the Game Editor mode, Behaviors drop down
6. The weapon can also be attached inside of a Ship's code using `attach('hasMyWeapon', sprite);`

## License

AGPL - Marak Squires
