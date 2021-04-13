
require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser');
const geckos = require('@geckos.io/server').default;
const { iceServers } = require('@geckos.io/server');

const Game = require('../lib/Geoffrey/Game');
const Thing = require('../lib/Geoffrey/Thing');
const Behavior = require('../lib/Geoffrey/Behavior');

// set the fps you need
const FPS = 30
global.phaserOnNodeFPS = FPS // default is 60


// prepare the config for Phaser
const config = {
  type: Phaser.HEADLESS,
  width: 1280,
  height: 720,
  banner: false,
  audio: false,
  fps: {
    target: FPS
  },
  scene: {
    preload: Game.preload,
    create: Game.create,
    update: Game.update,
    render: function(){}
  },
  physics: {
    default: 'matter',
    matter: {
      debug: false, // TODO: use config
      gravity: { y: 0, x: 0 },
      plugins: {
        attractors: true
      }
    }
  }
}
Game.bindUpdate(function(){
  console.log('running update')
});

let game = global.game =  new Phaser.Game(config);
Game.bindCreate(function(){
  console.log('xxxx', game)

  io = geckos({
    iceServers: iceServers
  })
  io.addServer(server)

  io.onConnection((channel) => {
    channel.onDisconnect(() => {
      console.log('Disconnect user ' + channel.id)
      channel.room.emit('removePlayer', channel.playerId)
    })

    Game.create(this);

    channel.on('addPlayer', (data) => {
      console.log(" ADD THE PLAYER", data);
      let startingLocation = {
        x: 300,
        y: 250
      };

      let p1 = Thing.create({
        name: 'PLAYER_1',
        x: startingLocation.x,
        y: startingLocation.y,
        texture: 'mib-caddy'
      });

      Behavior.attach('isMIBCaddy', p1, { 
        health: 10
      });

      Behavior.attach('hasScreenWrap', p1);
    })

    channel.emit('ready')
  });
  
  let level0 = Thing.create({
     name: 'sector-0'
  });
  Behavior.attach('isOnlineLevel', level0);
  
});

// TODO: add socket.io / gecko server directly here
const express = require('express')
const http = require('http')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const app = express()
const server = http.createServer(app)

const port = 3000

app.use(cors())
app.use(compression())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/online', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/online.html'))
})

app.get('/getState', (req, res) => {
  try {
    let gameScene = game.scene.keys['GameScene']
    return res.json({ state: gameScene.getState() })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port)
})

console.log(game)

// start the game
// new Phaser.Game(config)