const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
const getRandomNumber = require('../../utils/getRandomNumber');

// hasSkirmishMode
module.exports = {
  config: {
    stack: 0
  },
  preload: function (opts, game) {
    game.load.image('space', 'assets/levels/starfield.jpg');
  },
  create: function hasSkirmishModeCreate (sprite, opts, game) {

    const behaviors = require('../../behaviors');

    let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    bg.context.fillStyle = '#FFFFFF';
    bg.tint = 0xff0000;

    sprite.G.PLAYER_1 = {
      dead: true
    };
    sprite.G.PLAYER_2 = {
      dead: true
    };

    sprite.G.squad = {
      PLAYER_1: {
        ships: []
      },
      PLAYER_2: {
        ships: []
      }
    };

    ['PLAYER_1', 'PLAYER_2'].forEach(function(p, i){
      // TODO: replace with squad / squads
      let ships = Behavior.findByTag('ship');
      console.log('fff', ships)
      ships.forEach(function(b, i){
        let texture = behaviors[b].config.TEXTURE;
        let height = behaviors[b].config.HEIGHT;
        let width = behaviors[b].config.WIDTH;
        if (i === 0) {
          sprite.G.squad[p].ships.push({ name: 'MIB Caddy', behavior: b, texture: texture, selected: true, height: height, width: width });
        } else {
          sprite.G.squad[p].ships.push({ name: 'MIB Caddy', behavior: b, texture: texture, height: height, width: width });
        }
      });
    
    });

    let startingLocation = {
      x: 300,
      y: 250
    };
    
    // TODO: store state of skirmish here on sprite
    // This should include rosters for all squad, as well as stats for the matches

  },
  update: function hasSkirmishModeUpdate (sprite, game) {
    const behaviors = require('../../behaviors');

    // store skirmish state here
    const screenCenterX = game.cameras.main.worldView.x + game.cameras.main.width / 2;
    const screenCenterY = game.cameras.main.worldView.y + game.cameras.main.height / 2;

    ['PLAYER_1', 'PLAYER_2'].forEach(function(p, i){
      // if a player has died, spawn the item grid for that player 
      if (!Things[p] || sprite.G[p].dead) {
        let p2 = Thing.create({
          name: p,
          x: 0,
          y: 0,
        });
        sprite.G[p] = p2;
        sprite.G[p].dead = false;
        let shipSelector = Thing.create({
          name: p + 'ship-selector',
          matter: false
        });
        shipSelector.G.owner = p;
        shipSelector.x = 280;
        if (p === 'PLAYER_1') {
          shipSelector.y = 120;
        } else {
          shipSelector.y = 590;
        }

        Behavior.attach('isItemGrid', shipSelector, {
          items: sprite.G.squad[p].ships
        });
      }

      if (Things[p + 'ship-selector'] && Things[p + 'ship-selector'].G.itemGrid.selectionConfirmed) {
        Behavior.attach(Things[p + 'ship-selector'].G.itemGrid.selectedItem.behavior, Things[p]);
        Behavior.attach('hasScreenWrap', Things[p]);
        Things[p].x = getRandomNumber(0, 1024);
        Things[p].y = getRandomNumber(0, 768);
        Things[p + 'ship-selector'].G.itemGrid.group.destroy(true);
        Things[p + 'ship-selector'].G.itemGrid.selectFrame.setVisible(false);
        //Things[p + 'ship-selector'].G.itemGrid.destroy();
        Things[p + 'ship-selector'].G.destroy();
      }

    });
    

    // use top / down view for two players
    // use corner view for four players
  }
};