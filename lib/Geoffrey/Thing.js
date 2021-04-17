const Thing = {};
// const T = Things = require('./Things');
const _types = {};
const Behavior = require('./Behavior');
const Game = require('../../lib/Geoffrey/Game');

Thing.create = function createThing (opts, game) {

  // first, determine what the name of the thing will be
  // if a Thing has a type, Geoffrey will automatically give the Thing a name with an auto-incremented ID
  let name;
  if (opts.type) {
    if (typeof _types[opts.type] === 'undefined') {
      // check _types, if doesn't exist add new key and set to 0
      _types[opts.type] = 0;
    } else{
      // if key exists, increment the value
      _types[opts.type]++;
    }
    name = opts.type + '-' + _types[opts.type];
  }
  if (opts.name) {
    name = opts.name;
  }

  // console.log('creating thing with name: ', name, opts);
//  console.log('ooo', opts, game)
  let thing;
  // TODO: allow other types of things to be created, besides physics / matter things
  if (opts.gameobject === 'group') {
    thing = game.add.group();
  }
  else if (opts.gameobject === 'text') {
    thing = game.add.text(opts.x, opts.y, opts.text, opts.style);
  } else if (opts.matter === false) {
    thing = game.add.sprite(opts.x, opts.y, opts.texture, null);
  } else {
    thing = game.matter.add.sprite(opts.x, opts.y, opts.texture, null, { isStatic: opts.isStatic });
  }

  thing.setDepth(10);
  thing.behaviors = thing.behaviors || {};
  thing.name = name;
  thing.inputs = opts.inputs || {};

  if (typeof opts.sync !== 'undefined') {
    thing.sync = opts.sync;
  }

  if (typeof opts.height !== 'undefined') {
    thing.height = opts.height;
    //thing.displayHeight = opts.displayHeight;
  }

  if (typeof opts.width !== 'undefined') {
    thing.width = opts.width;
    // thing.displayWidth = opts.displayWidth;
  }

  // Namespace added for Geoffrey, easier this way to reference anything Geoffrey is doing vs Phaser.io API
  thing.G = {
    name: name,
    texture: opts.texture
  };

  if (opts.owner) {
    thing.G.owner = opts.owner;
  }

  thing.G.destroy = function () {
    var name = thing.name;
    let T = game.Things;
    // console.log("DESTROY", name, T[name])
    if (typeof T[name] !== "object") {
      // if it doesn't exist in Things, it shouldn't exist at all
      thing.destroy();
      return;
    }
    // first detach / remove all behaviors
    var bs = T[name].behaviors;
    if (bs) {
      Object.keys(bs).forEach(function (b) {
        if (typeof bs[b] === "object") {
          if (typeof bs[b].remove === "function") {
            bs[b].remove(T[name]);
          }
          Behavior.detach(b, T[name], {});
        }
      });
    }

    // then actually destroy the thing ( phaser.io sprite level destroy )
    thing.destroy();
    if (thing.attachments) {
      thing.attachments.getChildren().forEach(function(a){
        a.destroy();
      });
    }

    // delete references to the thing in Things memory
    delete T[name];
    // delete actual thing itself ( javascript level destroy )
    delete thing;
  }
  game.Things = game.Things || {};
  game.Things[thing.name] = thing;
  return thing;
};

Thing.inflate = function inflateThing (thingy) {
  // TODO: must check if Thing already exists, if so, then we want to apply the values and not create duplicate
  // console.log('Things[thingy.name]', thingy.name, Things[thingy.name])
  if (Things[thingy.name]) {
    //Things[thingy.name].x = thingy.x;
    //Things[thingy.name].y = thingy.y;
    //Things[thingy.name].body.velocity = thingy.velocity;
    //Things[thingy.name].body.angle = thingy.angle;
    // Things[thingy.name].rotation = thingy.rotation;
    Things[thingy.name].health = thingy.health;
  } else {
    // takes a serialized thing type structure ( thingy ),
    // and reinflates it back into an actual Thing using Thing.create
    let thing = Thing.create({
      name: thingy.name,
      owner: thingy.owner,
      texture: thingy.texture
    });
    for (let b in thingy.behaviors) {
      Behavior.attach(b, thing, thingy.behaviors[b].opts)
    }
  }

};

module.exports = Thing;