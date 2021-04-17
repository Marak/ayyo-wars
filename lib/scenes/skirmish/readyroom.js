/*


  TODO: allow players to select team, and configure team control ( human or ai )

*/


const Behavior = require('../../Geoffrey/Behavior');
let globalCollisionHandler = require('../../Geoffrey/Collisions');
const getRandomNumber = require('../../utils/getRandomNumber');

const Thing = require('../../Geoffrey/Thing');
const Input = require('../../Geoffrey/Input');

let i = 0;
var ReadyRoom = new Phaser.Class({


    Extends: Phaser.Scene,

    initialize:

    function ReadyRoom ()
    {
        Phaser.Scene.call(this, 'skirmish-readyroom');
    },

    preload: function ()
    {
      this.load.image('space', 'assets/levels/starfield.jpg');
      

    },

    create: function ()
    {

      let scene = this;
      const behaviors = require('../../behaviors');

      let p1 = Thing.create({
        name: 'PLAYER_1',
        x: 0,
        y: 0,
      }, scene);

      let navMenu = Thing.create({
        name: 'nav-menu',
        matter: false
      }, scene);

      // since we haven't called Thing.create yet, this.Things scope doesn't exist for scene yet...could fix
      this.Things = this.Things || {};
    },
    
    update: function (time, delta) {

      return;
      this.cameras.main.fadeOut(2000, 0, 0, 0);
      
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      		this.scene.stop('title')
      		this.scene.start(this.Things['nav-menu'].G.itemGrid.selectedItem.scene)
      	})

      
      
    }

});

module.exports = ReadyRoom;