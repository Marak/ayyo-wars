const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');

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

    var cam = game.cameras.main;
    cam.startFollow(sprite.mid);

    let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    bg.context.fillStyle = '#FFFFFF';
    bg.tint = 0xff0000;
    bg.setDepth(-1);

    game.text2 = game.add.text(250, 250, 'Alien Warz', { font: "74px Arial Black", fill: "#000" });
    game.text2.setStroke('#fff', 16);
    game.text2.setShadow(2, 2, "#333333", 2, true, true);

    let startingLocation = {
      x: 300,
      y: 250
    };

    let p1 = Thing.create({
      name: 'npc-0',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    startingLocation = {
      x: 100,
      y: 250
    };

    let p2 = Thing.create({
      name: 'npc-1',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });
    p2.tint = 0xff0000;
    
    Behavior.attach('isMIBCaddy', p1, { 
      health: 10
    });

    Behavior.attach('isMIBCaddy', p2, { 
      health: 10
    });

    Behavior.attach('aiFollow', p2, { 
      followTarget: p1
    });

    Behavior.attach('hasScreenWrap', p1);
    Behavior.attach('hasScreenWrap', p2);
  },
  update: function updateisLevel0 (sprite, game) {
    
    //console.log(Things.PLAYER_1.x, Things.PLAYER_1.y)
  }
};
