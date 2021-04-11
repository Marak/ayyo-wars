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
  // Using the Alien Warz JSON Format we can add default "Things" that will exist when the level is created
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
    const screenCenterY = game.cameras.main.worldView.y + game.cameras.main.height / 2;

    game.text2 = game.add.text(screenCenterX, screenCenterY, 'Alien Warz', { font: "74px Arial Black", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
    game.text2.setOrigin(0.5);
    game.text2.setStroke('#ccc', 16);
    game.text2.setShadow(2, 2, "#333333", 2, true, true);
    game.text2.setDepth(2);

    /*
    // Behavior.attach('allOtherPlayersDead', sprite);
    let sun = Thing.create({
      name: 'sun-0',
      x: 500,
      y: 500,
      isStatic: true,
      texture: 'mib-caddy'
    });
    Behavior.attach('hasGravity', sun);
    */

    let startingLocation = {
      x: 300,
      y: 250
    };

    let p1 = Thing.create({
      name: 'PLAYER_1',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    startingLocation = {
      x: 100,
      y: 250
    };

    let p2 = Thing.create({
      name: 'PLAYER_2',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });
    p2.setTint(tints['aqua']);
    Behavior.attach('isMIBCaddy', p1);
    Behavior.attach('hasWeaponSelector', p1);
    Behavior.attach('hasCloneDevice', p1);
    // Behavior.attach('hasQuantumLockDevice', p1);

    Behavior.attach('isMIBCaddy', p2, { 
      health: 10
    });

    p1.setDepth(66);
    p2.setDepth(99);

    /*
    Behavior.attach('aiFollow', p2, { 
      followTarget: p1
    });
    */

    let a1 = Thing.create({
      type: 'asteroid',
      matter: true,
      x: startingLocation.x + 100,
      y: startingLocation.y + 100
    });

    Behavior.attach('isAsteroid', a1, { 
      health: 10,
      height: 200,
      width: 200
    });

    Behavior.attach('hasScreenWrap', p1);
    Behavior.attach('hasScreenWrap', p2);
    Behavior.attach('hasScreenWrap', a1);

  },
  update: function updateisLevel0 (sprite, game) {
    // console.log(Things.PLAYER_1.x, Things.PLAYER_1.y)
    let = hsv = Phaser.Display.Color.HSVColorWheel();
    const top = hsv[i].color;
    const bottom = hsv[359 - i].color;

    // this.text1.setTint(top, top, bottom, bottom);
    game.text2.setTint(top, bottom, top, bottom);

    i++;

    if (i === 360)
    {
       i = 0;
    }
  }
};

