// hasEnergy
module.exports ={
  create: function createHasEnergy (sprite, opts) {
    sprite.G.energy = opts.energy || 100;
    sprite.G.energyRechargeTime = opts.rechargeTime || 200;
    sprite.G.energyRechargeAmount = opts.rechargeAmount || 5;
    if (opts.energy === 'unlimited') {
      opts.energy = 99999;
      sprite.G.energy = 99999;
    }
    sprite.G.maxEnergy = opts.energy || sprite.G.energy;
    var energyRechargeAmount = sprite.G.energyRechargeAmount || opts.rechargeAmount || 5,
        energyRechargeTime = sprite.G.energyRechargeTime || opts.rechargeTime || 500;

    var timer = game.time.addEvent({
        delay: energyRechargeTime, 
        callback: function () {
          if (sprite.G.energy < sprite.G.maxEnergy) {
            // dont increase enery over 100
            if (sprite.G.maxEnergy - sprite.G.energy < energyRechargeAmount) {
              sprite.G.energy += sprite.G.maxEnergy - sprite.G.energy;
            } else {
              sprite.G.energy += energyRechargeAmount;
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
