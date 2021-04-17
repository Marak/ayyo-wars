const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const tints = require('../../utils/tints');

//  hasPlasmaCannon
var BULLET_LIFESPAN = 5500;
var BULLET_RATE = 333;
var BULLET_SPEED = 260;
var BULLET_ENERGY = 15;
var BULLET_DAMAGE = 22;

module.exports = {
  lore: {
    name: 'Plasma Cannon',
    symbol: 'PC',
    flavor: 'Through centuries of experimentation we have found human technology disintegrates best when using plasma. - Ouriubiros, Draconian Minister of Foreign Relations'
  },
   create: function createPlasmaCannon (sprite, opts) {
     sprite.G.plasmaCannonTime = 0;
     sprite.megaBlasterControlKey = opts.controlKey || 'primaryWeaponKey';
   },
   update: function updatePlasmaCannon (sprite, game) {

     if (sprite.inputs[sprite.megaBlasterControlKey]) {
     // if (game.gamestate.inputs[sprite.name][sprite.megaBlasterControlKey] || sprite.autofire) {
       if (game.time.now > sprite.G.plasmaCannonTime) {
           // perform energy check
           if (sprite.G.energy <= BULLET_ENERGY) {
             return;
           }
           if (typeof sprite.G.energy === "number") {
             sprite.G.energy -= BULLET_ENERGY;
           }
           // if energy check passed, create bullet
           sprite.G.plasmaCannonTime = game.time.now + BULLET_RATE;

           let bullet = Thing.create({
             type: 'bullet',
             x: sprite.x,
             y: sprite.y,
             texture: 'bullet'
           }, game);

           bullet.G.owner = sprite.name;

           bullet.displayHeight = 20;
           bullet.displayWidth = 20;
           bullet.height = 20;
           bullet.width = 20;
           // bullet.tint = tints['aqua'];

           bullet.G.owner = sprite.name;
           bullet.G.hardness = 5;
           bullet.x = sprite.x;
           bullet.y = sprite.y;
           bullet.G.lifespan = BULLET_LIFESPAN;

           Behavior.attach("hasScreenWrap",  bullet, {}, game);
           Behavior.attach('hasLifespan', bullet, {
             lifespan: bullet.G.lifespan
           }, game);

           Behavior.attach('hasCollisions', bullet, {
             collidesWithSelf: false, // TODO: not supported yet?
             collidesWithSiblings: true,
             collidesWithChildren: true,
             collisionHandler: function (thing) {
               // sprite.megaBlastDamageSFX.play();
               let explosion = Thing.create({
                 type: 'explosion',
                 matter: false,
                 x: bullet.x,
                 y: bullet.y,
                 height: bullet.height * 0.66,
                 width: bullet.width * 0.66,
                 isStatic: true
               }, game);
               thing.G.health -= BULLET_DAMAGE;
               bullet.G.destroy(true, true);
               Behavior.attach('isExploding', explosion);
               return;
               // should also just destroy other things that arent players, or have low hardness?
               if (thing.player === true) {
                 thing.G.health -= BULLET_DAMAGE;
               } else {
               }
               if (thing.G.hardness && thing.G.hardness > bullet.G.hardness) {
                 thing.G.health = 0;
                 // bullet.G.destroy();
               } else {
                 thing.G.health = 0;
                 // bullet.G.destroy();
               }
             }
           }, game);

           bullet.angle = sprite.angle;
           bullet.setMass(1);
           bullet.setFriction(0,0);
           // bullet.thrust(0.02);
           var newVelocity = {};
           newVelocity.x = sprite.body.velocity.x + (Math.cos(sprite.rotation) * 10);
           newVelocity.y = sprite.body.velocity.y + (Math.sin(sprite.rotation) * 10);
           bullet.setVelocity(newVelocity.x,  newVelocity.y);
         }

     }

   }
 };
