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
    let startingLocation = {
      x: 300,
      y: 250
    };
    
    let a1 = Thing.create({
      type: 'asteroid',
      matter: true,
      x: startingLocation.x + 100,
      y: startingLocation.y + 100
    }, game);

    Behavior.attach('isAsteroid', a1, { 
      health: 10,
      height: 200,
      width: 200
    }, game);

    Behavior.attach('hasScreenWrap', a1);
  
  },
  update: function updateisLevel0 (sprite, game) {
  }
};

