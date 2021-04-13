// hasTeleporter
module.exports = {
  lore: {
    name: 'Teleporter',
    symbol: 'TP',
    flavor: 'Wshhhhhhhhhh'
  },
  create: function createHasTeleporter (sprite, opts) {
    sprite.G.teleportControlKey = opts.controlKey || 'secondaryWeaponKey';
    sprite.G.teleported = 0;
    sprite.G.teleportTime = 0;
    //sprite.teleportSFX = game.add.audio('teleport');
  },
  update: function updateHasTeleporter (sprite, game) {
    if (sprite.inputs && sprite.inputs[sprite.G.teleportControlKey]) {
      if ((game.time.now > sprite.G.teleportTime + 3000)) {
        sprite.G.teleportTime = game.time.now;
        if (sprite.G.energy < 20) {
          return;
        }
        if (typeof sprite.G.energy === 'number') {
          sprite.energy -= 20;
        }
        if (game.time.now > sprite.G.teleported + 600) {
          sprite.teleported = game.time.now;
          // TODO: un-hardcode worldWidth and worldHeight
          sprite.x = getRandomArbitrary(0, 1024);
          sprite.y = getRandomArbitrary(0, 768);
        }
      }
    }
  }
};

// TODO: replace with mersenne twister
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}