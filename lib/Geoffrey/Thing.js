const Thing = {};
const T = Things = require('./Things');
const _types = {};
const Behavior = require('./Behavior');

Thing.create = function createThing (opts) {
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

  let thing;
  // TODO: allow other types of things to be created, besides physics / matter things
  if (opts.gameobject === 'text') {
    thing = game.add.text(opts.x, opts.y, opts.text, opts.style);
  } else if (opts.matter === false) {
    thing = game.add.sprite(opts.x, opts.y, opts.texture);
  } else {
    thing = game.matter.add.sprite(opts.x, opts.y, opts.texture, null, { isStatic: opts.isStatic });
  }

  thing.behaviors = thing.behaviors || {};
  thing.name = name;

  // Namespace added for Geoffrey, easier this way to reference anything Geoffrey is doing vs Phaser.io API
  thing.G = {};

  if (opts.owner) {
    thing.G.owner = opts.owner;
  }

  thing.G.destroy = function () {
    var name = thing.name;
    // console.log("DESTROY", name, T[name])
    if (typeof T[name] !== "object") {
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
    /*
    if (thing.attachments) {
      thing.attachments.getChildren().forEach(function(a){
        a.destroy();
      });
    }
    */
    // delete references to the thing in Things memory
    delete T[name];
    // delete actual thing itself ( javascript level destroy )
    delete thing;
  }

  Things[thing.name] = thing;
  return thing;
};

module.exports = Thing;