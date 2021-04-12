# Ayyo Wars ( *Alpha* )

Ayyo Wars is an open-source and hackable 2d space battle game. It's built with Phaser.io and Node.js. It can be played in the browser.

## Home Page

[https://ayyowars.com](https://ayyowars.com)

## Project Goals

To create an amazing community built open-source video game which can be used as an educational tool for years to come. Blurring the lines between Programmer and Gamer. An omage to retro gaming. The next generation's MineCraft. 

<img width="963" alt="screen-shot-alpha" src="https://user-images.githubusercontent.com/70011/114273210-345df500-99e7-11eb-8eaa-6730847f113a.png">


## About

This repository is a fresh attempt of our project which has been in development for several years. We decided on a clean rewrite using [Geoffrey](https://github.com/Marak/ayyo-wars/tree/master/lib/Geoffrey) and to make the project open-source. The following game elements are designed and planned for our Beta release:

 - Online Multiplayer Battles
 - Epic Local Play
 - 12 Unique Ships
 - 24 Unique Weapons
 - 6 Unique Game Modes
 - Much Alien Lore

## Game Modes

### Local Skirmish ( beta )

Two teams of ships battle each other until no ships are left. Can be played with up to four players or Artifical Intelligences.

### Online Skirmish ( alpha )

Select a ship and connect online to battle other players. Uses WebRTC and UDP.

### Galaxy Mode ( very alpha )

Explore the galaxy in a space ship. Build bases. Gather resources. Battle aliens. Defend and conquer territories.

### Surival ( planned )

Choose a ship and battle Waves of enemies until you reach the end or die trying.

### Level Editor ( planned )

Create and modify all game behaviors including ships, weapons, items, and levels.

### Surface Mode ( planned )

Go on an away mission. Land on planets, moons, asteroids, and other celesetial bodies. Interact with worlds using a side-scrolling platformer view. Mine materials, discover ancient worlds, and try not to die before you get back to the ship!

## Local Installation

    git clone https://github.com/Marak/ayyo-wars
    cd ayyo-wars
    npm install
    npm run web

This will start a simple webserver that hosts the game. You should then be able to open `http://localhost:3000` in your browser to play.

## Local Development

    npm run watch

This will start a local build server that watches the project folder for changes. This will trigger a project build on code changes. Without running this command your code changes won't appear in the browser.

## Multiplayer Server

    npm run multiplayer

This will start a webserver to host the game, as well as an authoritative server, WebRTC server, and Websocket server. The authoritative server runs the game headlessly and the browser clients will broadcast their controller inputs to the server. In this mode, all game calculations run on the server and are broadcasted back to the client.

You should then be able to open `http://localhost:3000/online` in your browser to connect new players.

## Game Architecture

### Behaviors

Alien Wars utilizes a behavior based dependency injection pattern where each game object starts out as an empty `Thing` which can have `Behaviors` attached to it. Think of it as a [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science)) approach for defining game objects and behaviors instead of [object inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)).

Ships or other game objects are represented as collections of behaviors that run every update of the game loop. These behaviors control how the game object will act. Complex behaviors can be created through seamlessly composing several smaller behaviors.

Behaviors can also be attached and detatched dynamically during game play. It's even safe to re-apply the same behavior twice to the same game object. All of this is very useful for keeping game scaffolding code to a minmial and allowing for features like live game editing.

See current game behaviors here: [https://github.com/Marak/ayyo-wars/tree/master/lib/behaviors/index.js](https://github.com/Marak/ayyo-wars/tree/master/lib/behaviors/index.js)

### Online Mode

*Online Protocols*

Ayyo Wars supports multiplayer through the use of an authoratitive server which runs all game calculations. Each client connects using UDP and Webrtc to create a direct peer connection to the server. Websockets are also used as a signaling server for the WebRTC connections.

*Client-Side Prediction / Lag Compensation / Snapshot Interpolation*

Through the use of the [snapshot-interpolation](https://github.com/geckosio/snapshot-interpolation) library, Ayyo Wars is able to perform client-side prediction for all game object movement and then reconcile those objects against the server state. In online mode all clients broadcast their inputs to the authortative server, which then sends back the actual server-side calculated positions to the client which updates based on the snapshot state differential.

## Modifying Game Contents

## `window.Things`

Guess what? Every single game object is easily accessible in a flat structure via `window.Things`. Simply access the `Thing` you'd like inspect using `console.log(Things['PLAYER_1'])`, etc...

## The `G` Scope

Each `Thing` will have a property called `G`, this is short for [Geoffrey](https://github.com/Marak/ayyo-wars/tree/master/lib/Geoffrey). Anything related to our game logic ( and not directly to Phaser.js ) will be stored in the `G` scope. This is *super* useful when creating or modifying game content. You can also modify `G` values live while the game is playing directly through the console.

Try: `console.log(Things['PLAYER_1'].G)`

### Audio and Image Assets

Game audio and images are stored here: [https://github.com/Marak/ayyo-wars/tree/master/public/assets](https://github.com/Marak/ayyo-wars/tree/master/public/assets)

Any image or sound can be modified or replaced in the game. Simply search for the asset you want to modify and open it with your favorite editing application.

New assets can also be put into this folder, but you will need to be sure to `preload` them in your Behavior's `preload` function.

## License

AGPL - Marak Squires
