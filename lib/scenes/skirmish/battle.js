const Behavior = require('../../Geoffrey/Behavior');
let globalCollisionHandler = require('../../Geoffrey/Collisions');
const getRandomNumber = require('../../utils/getRandomNumber');

const Thing = require('../../Geoffrey/Thing');
const Input = require('../../Geoffrey/Input');

let i = 0;
var Battle = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Battle ()
    {
        Phaser.Scene.call(this, 'skirmish-battle');
    },

    preload: function ()
    {
      this.load.image('space', 'assets/levels/starfield.jpg');
      
      this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
        globalCollisionHandler(event, bodyA, bodyB);
      });

    },

    create: function ()
    {
      this.cameras.main.fadeIn(1000, 0, 0, 0)

      this.viewSettingsTime = 0;
      this.justTookVictoryLap = true;
      this.isTakingVictoryLap = false;

      const behaviors = require('../../behaviors');
      // TODO: cleanup this new contract, artifact of old API
      let game = this;
      let sprite = game;
      sprite.G = sprite.G || {};
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
      
      this.skirmishBattleHUD1 = Thing.create({
        name: 'skirmish-battle-HUD',
        gameobject: 'text',
        text: `
          PLAYER 1
          0 Energy
          0 Life
        `,
        x: 20,
        y: 20
      }, game);
      var style = { font: "22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      this.skirmishBattleHUD1.setStyle(style);
      this.skirmishBattleHUD1.setVisible(false);

      this.skirmishBattleHUD2 = Thing.create({
        name: 'skirmish-battle-HUD',
        gameobject: 'text',
        text: `
          PLAYER 2
          0 Energy
          0 Life
        `,
        x: 790,
        y: 20
      }, game);
      var style = { font: "22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      this.skirmishBattleHUD2.setStyle(style);
      this.skirmishBattleHUD2.setVisible(false);

      this.victoryText = Thing.create({
        name: 'skirmish-battle-victory-text',
        gameobject: 'text',
        text: `
          PLAYER 1 IS VICTORIOUS!
        `,
        x: 220,
        y: 220
      }, game);
      var style = { font: "48px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      this.victoryText.setStyle(style);
      this.victoryText.setScrollFactor(0);
      this.victoryText.setVisible(false);
      this.victoryText.setDepth(11);

      ['PLAYER_1', 'PLAYER_2'].forEach(function(p, i){
        // TODO: replace with squad / squads
        let ships = Behavior.findByTag('ship');
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

      // since we haven't called Thing.create yet, this.Things scope doesn't exist for scene yet...could fix
      this.Things = this.Things || {};
    },
    
    update: function (time, delta) {
      const behaviors = require('../../behaviors');
      let game = this;
      let sprite = game;
      let Things = this.Things;
     // console.log('tttt', this.Things, this)
      // store skirmish state here
      const screenCenterX = game.cameras.main.worldView.x + game.cameras.main.width / 2;
      const screenCenterY = game.cameras.main.worldView.y + game.cameras.main.height / 2;


      function victoryLap (player) {
        game.isTakingVictoryLap = true;

        game.skirmishBattleHUD1.setVisible(false);
        game.skirmishBattleHUD2.setVisible(false);


        game.victoryText.setText(`${player.replace('_', ' ')} IS VICTORIOUS!`)

        game.victoryText.setVisible(true);

        game.cameras.main.startFollow(game.Things[player])

        var timer = game.time.addEvent({
            delay: 5000,
            callback: function () {
              game.isTakingVictoryLap = false;
              game.cameras.main.stopFollow(game.Things[player])
              let screenCenterX = game.cameras.main.worldView.width / 2;
              let screenCenterY = game.cameras.main.worldView.height / 2;
              game.cameras.main.centerOnX(screenCenterX);
              game.cameras.main.centerOnY(screenCenterY);
              game.justTookVictoryLap = true;
              game.skirmishBattleHUD1.setVisible(true);
              game.skirmishBattleHUD2.setVisible(true);
              game.victoryText.setVisible(false);
            },
            //args: [],
            callbackScope: this,
            loop: false
        });
        return;
      };

      // function showShipSelectorWhenPlayerDies()
      ['PLAYER_1', 'PLAYER_2'].forEach(function(p, i){
        // if a player has died, spawn the item grid for that player 
        if (!Things[p] || sprite.G[p].dead) {

          if (game.isTakingVictoryLap) {
            return;
          }

          if (!game.justTookVictoryLap) {
            if (p == 'PLAYER_1') {
              victoryLap('PLAYER_2');
            } else {
              victoryLap('PLAYER_1');
            }
            return;
          }

          // TODO: unhard-code from 2 players
          if (p == 'PLAYER_1') {
            game.skirmishBattleHUD1.setVisible(false);
          } else {
            game.skirmishBattleHUD2.setVisible(false);
          }

          let p2 = Thing.create({
            name: p,
            x: 0,
            y: 0,
          }, game);
          sprite.G[p] = p2;
          sprite.G[p].dead = false;
          let shipSelector = Thing.create({
            name: p + 'ship-selector',
            matter: false
          }, game);
          shipSelector.G.owner = p;
          shipSelector.x = 80;
          let ACTIVE_COLOR = 0x6666ff;

          if (!shipSelector.bg) {
            if (p === 'PLAYER_1') {
              shipSelector.y = 120;
              shipSelector.bg = game.add.rectangle(510, 150, 960, 200, ACTIVE_COLOR);
            } else {
              shipSelector.y = 590;
              shipSelector.bg = game.add.rectangle(510, 620, 960, 200, ACTIVE_COLOR);
            }
            shipSelector.bg.setDepth(0);
          }

          if (!shipSelector.shipName) {
            let shipInfo = {};
            shipInfo.x = 580;
            if (p === 'PLAYER_1') {
              shipInfo.y = 65;
            } else {
              shipInfo.y = 535;
            }
            
            let padding = 30;
            let style = { font: "24px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            shipSelector.shipName = game.add.text(shipInfo.x + 100, shipInfo.y, 'is good ship', style);
            shipSelector.shipName.setDepth(5);
            
            shipSelector.shipPrimaryWeapon = game.add.text(shipInfo.x, shipInfo.y + padding + 10, 'ship primary weapon', style);
            shipSelector.shipPrimaryWeapon.setDepth(5);

            shipSelector.shipSecondaryWeapon = game.add.text(shipInfo.x, shipSelector.shipPrimaryWeapon.y + padding, 'ship secondary weapon', style);
            shipSelector.shipSecondaryWeapon.setDepth(5);

            shipSelector.shipSpecialWeapon = game.add.text(shipInfo.x, shipSelector.shipSecondaryWeapon.y + padding, 'ship special weapon', style);
            shipSelector.shipSpecialWeapon.setDepth(5);


            let flavorStyle = { font: "18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            
            shipSelector.shipFlavor = game.add.text(shipInfo.x, shipSelector.shipSpecialWeapon.y + padding + 10, 'ship flavor text', flavorStyle);
            shipSelector.shipFlavor.setDepth(5);
            
            
          }

          Behavior.attach('isItemGrid', shipSelector, {
            items: sprite.G.squad[p].ships
          });

        }

        // >_>
        let shipSelector = Things[p + 'ship-selector'];
        if (shipSelector) {
          let selectedBehavior = shipSelector.G.itemGrid.items[shipSelector.G.itemGrid.selectedIndex].behavior;
          let lore = behaviors[selectedBehavior].lore;
          shipSelector.shipName.setText(lore.name);
          shipSelector.shipPrimaryWeapon.setText('Primary:       ' + lore.primaryWeapon);
          shipSelector.shipSecondaryWeapon.setText('Secondary:  ' + lore.secondaryWeapon);
          shipSelector.shipSpecialWeapon.setText('Special:       ' + lore.specialWeapon);
          shipSelector.shipFlavor.setText(lore.flavor);
        }

        if (Things[p + 'ship-selector'] && Things[p + 'ship-selector'].G.itemGrid.selectionConfirmed) {
          // attach ship behavior to player, this line spawns the new ship
          Behavior.attach(Things[p + 'ship-selector'].G.itemGrid.selectedItem.behavior, Things[p]);
          console.log('setting justTookVictoryLap to false');
          game.justTookVictoryLap = false;
          // TODO: unhard-code from 2 players
          if (p === 'PLAYER_1') {
            game.skirmishBattleHUD1.setVisible(true);
          } else {
            game.skirmishBattleHUD2.setVisible(true);
          }

          Behavior.attach('hasScreenWrap', Things[p]);
          Things[p].x = getRandomNumber(0, 1024);
          Things[p].y = getRandomNumber(0, 768);
          Things[p + 'ship-selector'].G.itemGrid.group.destroy(true);
          Things[p + 'ship-selector'].bg.destroy();
          Things[p + 'ship-selector'].shipName.destroy();
          Things[p + 'ship-selector'].shipPrimaryWeapon.destroy();
          Things[p + 'ship-selector'].shipSecondaryWeapon.destroy();
          Things[p + 'ship-selector'].shipSpecialWeapon.destroy();
          Things[p + 'ship-selector'].shipFlavor.destroy();
          Things[p + 'ship-selector'].G.itemGrid.selectFrame.setVisible(false);
          //Things[p + 'ship-selector'].G.itemGrid.destroy();
          Things[p + 'ship-selector'].G.destroy();
          // hard-code p2 to AI ( for now )
          if (p === 'PLAYER_2') {
            Behavior.attach('aiFollow', Things[p]);
            Behavior.attach('aiTriggerHappy', Things[p]);
          }
        }

        game.skirmishBattleHUD1.setText(`
          ${p}
            ${game.Things[p].G.health} Health
            ${game.Things[p].G.energy} Energy
        `);

      });

      // TODO: fix escape / controls scren toggle
      /*
      if (
        (this.Things['PLAYER_1'].inputs.escape || this.Things['PLAYER_2'].inputs.escape)
        && !this.viewingSettings
      ) {
        
        if (this.time.now > this.viewSettingsTime) {
          this.viewSettingsTime = this.time.now + 2000;
          this.viewingSettings = true;
          this.scene.pause();
          // scene.Things = {};
          this.scene.launch('settings-controls');
        }
        
      }
      */
      
      let scene = this;
      Input.process(this);
      // Game.update(game);
      for (let thing in this.Things) {
        // console.log('updating', thing, Things[thing].inputs)
        Behavior.process(this.Things[thing], this, { time, delta });
      }
      
      
    }

});

module.exports = Battle;
