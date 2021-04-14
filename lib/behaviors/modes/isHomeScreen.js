const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');
const tints = require('../../utils/tints');

let i = 0;
// isLevel0
// level0 is current melee / skirmish level
module.exports = {
  winConditions: [
    {
      // level is complete once one of the players achieved "allOtherPlayersDead" win condition
      name: 'allOtherPlayersDead'
    }
  ],
  preload: function preloadMibCaddy (opts, game) {
    game.load.image('space', 'assets/levels/starfield.jpg');
  },
  // Using the Ayyo Wars JSON Format we can add default "Things" that will exist when the level is created
  things: {
    /*
    "planet-1": {
        "name": "planet-1",
        "x": 190,
        "y": 460,
        "circle": 25,
        "health": 50,
        "angle": 0,
        "behaviors": {
            "isPlanetoid": {}
        }
    }*/
  },
  create: function createisLevel0 (sprite, opts, game) {
    // alert('start battle')
    // alert('created new level0')
    sprite.line = new Phaser.Geom.Line(0, 0, 200, 200);
    sprite.mid = new Phaser.Geom.Point();
    sprite.G.impacts = false;
    var cam = game.cameras.main;
    cam.startFollow(sprite.mid);

    let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    bg.context.fillStyle = '#FFFFFF';
    bg.tint = 0xff0000;
    bg.setDepth(-1);

    const screenCenterX = game.cameras.main.worldView.x + game.cameras.main.width / 2;
    const screenCenterY = game.cameras.main.worldView.y + game.cameras.main.height / 4;

    game.text2 = game.add.text(screenCenterX, screenCenterY, 'Ayyo Wars', { font: "74px Arial Black", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
    game.text2.setOrigin(0.5);
    game.text2.setStroke('#ccc', 16);
    game.text2.setShadow(2, 2, "#333333", 2, true, true);
    game.text2.setDepth(2);

    let p1 = Thing.create({
      name: 'PLAYER_1',
      x: 0,
      y: 0,
    });

    let navMenu = Thing.create({
      name: 'nav-menu',
      matter: false
    });
    
    navMenu.G.owner = 'PLAYER_1';
    navMenu.x = 400;
    navMenu.y = 400;
    Behavior.attach('isItemGrid', navMenu, {
      columns: 1,
      rows: 10,
      cellWidth: 220,
      cellHeight: 80,
      cellAlign: Phaser.Display.Align.LEFT_CENTER,
      frameOffsetX: 120,
      frameOffsetY: 20,
      selectFrame: game.add.rectangle(20, 50, 260, 40, 0xCCCCCC),
      items: [
        { text: 'Local Skirmish', selected: true, url: '/skirmish' },
        { text: 'Demo Mode', url: '/demo' }
  //      ,{ text: 'Game Options' }
      ]
    });

  },
  update: function updateisLevel0 (sprite, game) {
    // console.log(Things.PLAYER_1.x, Things.PLAYER_1.y)
    let = hsv = Phaser.Display.Color.HSVColorWheel();
    const top = hsv[i].color;
    const bottom = hsv[359 - i].color;

    if (Things['nav-menu'].G.itemGrid.selectionConfirmed) {
      console.log('selected', Things['nav-menu'].G.itemGrid.selectedItem)
      document.location = Things['nav-menu'].G.itemGrid.selectedItem.url;
    }

    // this.text1.setTint(top, top, bottom, bottom);
    game.text2.setTint(top, bottom, top, bottom);

    i++;

    if (i === 360)
    {
       i = 0;
    }
  }
};

