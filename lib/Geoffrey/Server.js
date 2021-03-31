const Server = {};
const appConfig = {};
const express = require('express');
const WebSocketServer = require('ws').Server;
const wrtc = require('wrtc');
const Peer = require('simple-peer')

const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation');
const SI = new SnapshotInterpolation(60)
const path = require('path');
const view = require('view');

let wss;
let peers = {};
Server.listen = async function listenServer ({ root }) {

  const app = express();
  const server = require('http').Server(app);

  app.use(express.static(path.resolve(root + '/../public')));

  if (appConfig.cacheView) {
    // cached view
    console.log('using cached view');
    let _view = await viewCreate( { path: root + "/../view" });
    app.use(view.middle({view: _view}));
  } else {
    // uncached view
    console.log('using uncached view');
    app.use(function(req, res, next){
      view.create( { path: root + "/../view" }, function(err, _view){
        req.resource = {
          params: {}
        };
        return view.middle({view: _view})(req, res, next)
      });
    });
  }
  createWebsocketServer();
  server.listen(3000, function () {
    console.log(`Listening on ${server.address().port}`);
  });

};


// TODO: create new peer for each connected client...
let players = [
  'PLAYER_1',
  'PLAYER_2',
  'PLAYER_3',
  'PLAYER_4'
];

function createPeer (playerName) {

  let peer = new Peer({ wrtc: wrtc });

  peer.on('data', function(data){
    let Things = require('../../lib/Geoffrey/Things');
    
    //console.log('peer.data', data.toString());
    // peer.send('fudge has been made');
    // TODO: add server-side game processing here
    // TODO: only rebroadcast game-state, no out of band messages
    /*
    let msg;
    for (let id in peers) {
      if (peers[id].writable) {
        peers[id].send(data.toString())
      }
    }
    return;
    */
    try {
      msg = JSON.parse(data);
      Things[msg.name].inputs = msg.inputs;
      // console.log('setting',  msg.name, Things[msg.name].inputs)
    } catch (err) {
      console.log('parsing error', err)
    }
    /*
    for (let id in peers) {
      if (peers[id].writable) {
        peers[id].send(data.toString())
      }
    }*/
  });

  peer.on('signal', function(data){
    console.log('peer.signal', data);
    wss.clients.forEach(function each(client) {
      console.log('found client', client.id);
      client.send(JSON.stringify(data));
    });
  });

  peer.on('disconnect', function () {
    players.push(playerName);
  });

  peer.on('connect', function () {
    console.log('connect');
    
    // TODO: random x / y
    let startingLocation = {
      x: 150 + players.length * 10,
      y: 250 + players.length * 10
    };

    console.log('CREATING NEW PLAYER', playerName)
    let p1 = Thing.create({
      name: playerName,
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    p1.setDepth(10);

    Behavior.attach('isMIBCaddy', p1, { 
      health: 10
    });
    Behavior.attach('hasScreenWrap', p1);
  });
  return peer;
}

function createWebsocketServer () {
  wss = new WebSocketServer({port: 3434});
  console.log('starting websocket server on port 3434');
  createHeadlessGame();
  wss.on('connection', function(ws) {
    // on a websocket connection, get the client ready for a webrtc peering signal with webrtc server
    // TODO: uuid?
    ws.id = new Date().getTime();

    let playerName;
    ws.on('message', function(message) {
      var data = JSON.parse(message);
      console.log('received: %s', message, data);
      /*
        Perform a handshake here with the client
        Now that the client has connected to the game, we need to determine if they will play
        Certain settings would be chosen here such as name
      */
      if (data.type === 'joinGame') {

        if (players.length === 0) {
          // TODO: send error back to client
          console.log('will not allow more than N players. should have stopped before this connected.')
          return;
        }

        playerName = players.shift();
        console.log('accepted game for', playerName)
        ws.send(JSON.stringify({ type: 'acceptedGame', playerName: playerName }));
        return;
      }

      if (data.type === 'signal') {
        console.log('sending signal for', playerName)
        let peer = peers[this.id] = createPeer(playerName);
        peer.signal(data.payload)
      }
      return;
      /*
      var sendingID = this.id;
      wss.clients.forEach(function each(client) {
        console.log('found client', client.id);
        peer2.signal(data.payload)
        if (client !== ws) {
          client.send(message);
        }
        if (client.readyState === 'WebSocket.OPEN') {
        }
      });
      */
    });
  });
}

require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser');
const Game = require('../../lib/Geoffrey/Game');
const Thing = require('../../lib/Geoffrey/Thing');
const Behavior = require('../../lib/Geoffrey/Behavior');
Behavior.mode = 'server';
// TODO: add headless server, have it broadcast it's state to each client as the authority
function createHeadlessGame () {

  // set the fps you need
  const FPS = 60
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
  let game = global.game =  new Phaser.Game(config);
  Game.servermode = true;
  Game.bindUpdate(function(game){
    const snapshot = SI.snapshot.create(game.gamestate.currentState);
    SI.vault.add(snapshot);
    for (let id in peers) {
    //console.log('state', game.gamestate.currentState);
    //console.log('ppppp', peers[id])
      if (peers[id].writable) {
        try {
          peers[id].send(JSON.stringify(snapshot));
        } catch (err) {
          
        }
      }
    }
    return
    for (let id in peers) {
      //console.log('state', game.gamestate.currentState);
      //console.log('ppppp', peers[id])
      if (peers[id].writable) {
        try {
          peers[id].send(JSON.stringify(game.gamestate.currentState));
        } catch (err) {
        }
      }
    }
  });

  Game.bindCreate(function(){
    game.peers = peers;
    let level0 = Thing.create({
       name: 'sector-0',
       type: 'server-only'
    });
    Behavior.attach('isOnlineLevel', level0);
    Behavior.attach('hasStateManager', level0);
  });
}


module.exports = Server;