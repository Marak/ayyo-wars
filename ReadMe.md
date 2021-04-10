# Alien Warz

Alien Warz is an open-source and hackable 2d starship asteroids like space battle game. It's built with Phaser.io and Node.js. It can be played in the browser.

## Home Page

[https://alienwarz.com](https://alienwarz.com)

## Project Goals

To create an amazing community built open-source game which can be used as an educational tool for years to come. Blurring the lines between Programmer and Gamer. An omage to retro gaming. The next generation's MineCraft. 

<img width="963" alt="screen-shot-alpha" src="https://user-images.githubusercontent.com/70011/114273210-345df500-99e7-11eb-8eaa-6730847f113a.png">


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

### Level Editor ( planned )

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

Alien Wars utilizes a Behavior based system dependency injection pattern where every game object starts out as an empty `Thing` which can have `Behaviors` `attached to it. Think of it as a [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science)) approach for defining game objects and behaviors instead of [object inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)).

Ships or other game objects are represented as collections of behaviors, each of which acts on the sprite on every update of the game loop. These behaviors control how the sprite will act. Complex behaviors can be created through seamlessly composing several smaller behaviors.

Behaviors can also be attached and detatched dynamically during game play. It's even safe to re-apply the same behavior twice to the same game object. This is very useful for keeping game scaffolding code to a minmial and allowing for features like live game editing.

See current behaviors here: [https://github.com/Marak/alien-warz/tree/master/lib/behaviors](https://github.com/Marak/alien-warz/tree/master/lib/behaviors)


### Audio and Image Assets

Game audio and images are stored here: [https://github.com/Marak/alien-warz/tree/master/public/assets](https://github.com/Marak/alien-warz/tree/public/assets)

Any image or sound can be modified or replaced in the game. Simply search for the asset you want to modify and open it with your favorite editing application.

New assets can also be put into this folder, but you will need to be sure to `preload` them in your Behavior's `preload` function.

### Online Mode

*Online Protocols*

Alien Warz supports multiplayer through the use of an authoratitive server which runs all game calculations. Each client connects using UDP and Webrtc to create a direct peer connection to the server. Websockets are also used as a signaling server for the WebRTC connections.

Client Prediction / Lag Compensation / Snapshot Interpolation

Through the use of the [https://github.com/geckosio/snapshot-interpolation](snapshot-interpolation) library, Alien Warz is able to perform client-side prediction for all game object movement and then reconcile those objects against the server state. In online mode all clients broadcast their inputs to the authortative server, which then sends back the actual server-side calculated positions to the client which adjusts them based the snapshot state differential.

## Modifying Game Contents

## `window.Things`

Guess what? Every single game object is easily accessible in a flat structure via `window.Things`. Simply access the `Thing` you'd like inspect using `console.log(Things['PLAYER_1'])`, etc...

## The `G` Scope

Each `Thing` will have a property called `G`, this is short for [Geoffrey](https://github.com/Marak/alien-warz/tree/master/lib/Geoffrey). Anything related to our game logic ( and not directly to Phaser.js ) will be stored in the `G` scope. This is *super* useful when creating or modifying game content. You can also modify `G` values live while the game is playing directly through the console.

Try: `console.log(Things['PLAYER_1'].G)`

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
