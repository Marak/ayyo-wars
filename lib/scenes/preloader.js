let globalCollisionHandler = require('../Geoffrey/Collisions');


var Preloader = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Preloader ()
    {
        Phaser.Scene.call(this, 'preloader');
    },

    preload: function ()
    {
        console.log('preloading...')
      let game = this;
        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
          globalCollisionHandler(event, bodyA, bodyB);
        });

        const behaviors = require('../behaviors');

        for (let b in behaviors) {
          if (typeof behaviors[b].preload === "function") {
            try {
              console.log('preloading sprite',  behaviors[b].preload.toString())
              behaviors[b].preload(behaviors[b].config, game);
            } catch (err) {
              console.log('error running ' + b + '.preload()', err);
            }
          }
        }
      
    },

    create: function ()
    {
        console.log('starting title scene')
        this.scene.start('title');
    }

});

module.exports = Preloader;