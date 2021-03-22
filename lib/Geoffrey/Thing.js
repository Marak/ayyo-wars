const Thing = {};
const Things = require('./Things');
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
  console.log('creating thing with name: ', name, opts);

  let thing;
  // TODO: allow other types of things to be created, besides physics / matter things
  thing = game.matter.add.sprite(opts.x, opts.y, opts.texture);
  thing.behaviors = thing.behaviors || {};
  thing.name = name;
  Things[thing.name] = thing;
  return thing;
};

module.exports = Thing;