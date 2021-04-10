// hasEnergy
module.exports ={
  create: function createHasEnergy (sprite, opts) {
    sprite.G.energy = opts.energy || 100;
    if (opts.energy === 'unlimited') {
      opts.energy = 99999;
      sprite.G.energy = 99999;
    }
    sprite.G.maxEnergy = opts.energy || sprite.G.energy;
    var rechargeEnergyRate = sprite.G.rechargeEnergyRate || opts.rechargeEnergyRate || 5,
        rechardEnergyTime = sprite.G.rechardEnergyTime || 500;

    var timer = game.time.addEvent({
        delay: rechardEnergyTime, 
        callback: function () {
          if (sprite.G.energy < sprite.G.maxEnergy) {
            // dont increase enery over 100
            if (sprite.G.maxEnergy - sprite.G.energy < rechargeEnergyRate) {
              sprite.G.energy += sprite.G.maxEnergy - sprite.G.energy;
            } else {
              sprite.G.energy += rechargeEnergyRate;
            }
          }
        },
        //args: [],
        callbackScope: this,
        loop: true
    });
  },
  update: function updateHasEnergy (sprite) {
  }
};
