const Behavior = require('../Geoffrey/Behavior');

const Things = require('../Geoffrey/Things');
const Input = require('../Geoffrey/Input');


let i = 0;
var Title = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Title ()
    {
        Phaser.Scene.call(this, 'title');
    },

    preload: function ()
    {
       console.log('preload')
        this.load.image('space', 'assets/levels/starfield.jpg');
    },

    create: function ()
    {
      this.cameras.main.fadeIn(1000, 0, 0, 0)
      const Thing = require('../Geoffrey/Thing');
      
      let scene = this;
       console.log('create title screen')
      Things['homescreen'] = this;
      //Behavior.attach('isHomeScreen', this);
      
      console.log(Thing)
      scene.changingScreen = false;
      let bg = scene.add.tileSprite(0, 0, 20000, 20000, 'space');
      bg.context.fillStyle = '#FFFFFF';
      bg.tint = 0xff0000;
      bg.setDepth(-1);

      const screenCenterX = scene.cameras.main.worldView.x + scene.cameras.main.width / 2;
      const screenCenterY = scene.cameras.main.worldView.y + scene.cameras.main.height / 4;

      let logo = Thing.create({
        name: 'welcome-logo',
        x: screenCenterX,
        y: screenCenterY,
        gameobject: 'text',
        text: 'Ayyo Wars',
        style: { font: "74px Arial Black", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" }
      }, scene);

      logo.setOrigin(0.5);
      logo.setStroke('#ccc', 16);
      logo.setShadow(2, 2, "#333333", 2, true, true);
      logo.setDepth(2);

      let p1 = Thing.create({
        name: 'PLAYER_1',
        x: 0,
        y: 0,
      }, scene);

      let navMenu = Thing.create({
        name: 'nav-menu',
        matter: false
      }, scene);

      navMenu.G.owner = 'PLAYER_1';
      navMenu.x = 400;
      navMenu.y = 400;
      Behavior.attach('isItemGrid', navMenu, {
        columns: 1,
        rows: 10,
        cellWidth: 220,
        cellHeight: 80,
        cellAlign: Phaser.Display.Align.LEFT_CENTER,
        selectTimeDelay: 120,
        frameOffsetX: 120,
        frameOffsetY: 20,
        selectFrame: scene.add.rectangle(20, 50, 260, 40, 0xCCCCCC),
        items: [
          { text: 'Demo Mode',  selected: true, url: '/demo', scene: 'demo' },
          { text: 'Local Skirmish', url: '/skirmish', scene: 'skirmish' }
        ]
      }, scene);
      
        // this.scene.start('demo');
    },
    update: function (time, delta) {
      
      
      //console.log('running update')
      let = hsv = Phaser.Display.Color.HSVColorWheel();
      const top = hsv[i].color;
      const bottom = hsv[359 - i].color;
    
      if (!this.changingScreen) {
        if (this.Things['nav-menu'].G.itemGrid.selectionConfirmed) {
          console.log(this)
          this.changingScreen = true;
          
          this.cameras.main.fadeOut(2000, 0, 0, 0);
          
          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
          		this.scene.stop('title')
          		this.scene.start(this.Things['nav-menu'].G.itemGrid.selectedItem.scene)
          	})
        
          // document.location = Things['nav-menu'].G.itemGrid.selectedItem.url;
        }
      }

      this.Things['welcome-logo'].setTint(top, bottom, top, bottom);
      i++;

      if (i === 360) {
        i = 0;
      }


      Input.process(this);
      // Game.update(game);
      for (let thing in this.Things) {
        // console.log('updating', thing, Things[thing].inputs)
        Behavior.process(this.Things[thing], this, { time, delta });
      }
    }

});

module.exports = Title;