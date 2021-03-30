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

function createPeer () {
  
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

  let i = 1;
  peer.on('connect', function () {
    console.log('connect');
    
    let startingLocation = {
      x: 150,
      y: 250
    };

    let p1 = Thing.create({
      name: 'PLAYER_' + i,
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    p1.setDepth(10);

    Behavior.attach('isMIBCaddy', p1, { 
      health: 10
    });
    Behavior.attach('hasScreenWrap', p1);
    i++;
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

    // send back a waiting message to the client, letting them know the websocket server has connected
    wss.clients.forEach(function each(client) {
      if (client !== ws) {
        client.send(JSON.stringify({
          'type': 'waiting'
        }, true, 2));
      }
    });

    ws.on('message', function(message) {
      var data = JSON.parse(message);
      console.log('received: %s', message, data);
      if (data.type === 'signal') {
        let peer = peers[this.id] = createPeer();
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