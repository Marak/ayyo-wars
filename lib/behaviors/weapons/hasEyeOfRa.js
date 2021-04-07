//  hasEyeOfRa
const Thing = require('../../Geoffrey/Thing');
const Behavior = require('../../Geoffrey/Behavior');
const tints = require('../../utils/tints');

// TODO: replace scope of bullets with megaBlasts
var worldScale = 1;
var BULLET_LIFESPAN = 12500;
var BULLET_RATE = 999;
var BULLET_SPEED = 450;
var BULLET_DAMAGE = 22;
var i = 0;
module.exports = {
   tags: ['weapon', 'offensive', 'long-range'],
   create: function createEyeOfRa (sprite, opts) {
     sprite.eyeOfRaTime = 0;
     sprite.eyeOfRaControlKey = opts.controlKey || 'primaryWeaponKey';
     sprite.eyeOfRaCharging = false;
     sprite.eyeOfRaTracking = false;
     sprite.eyeOfRaMultiplier = 0;
   },
   update: function updateEyeOfRa (sprite, game) {

     if ((sprite.inputs && sprite.inputs[sprite.eyeOfRaControlKey]) /*|| sprite.autofire*/) {
       if (sprite.eyeOfRaCharging) {
         sprite.eyeOfRaTracking = false;
         // TODO: make sure to destroy or do something with eye of ra is ship is destroyed....perhaps fire it as is?
         var bullet = sprite.eyeofRaBullet;
         if (bullet) {
           // bullet.angle = sprite.angle;
           bullet.rotation = sprite.rotation;
           sprite.eyeOfRaMultiplier = 0.33;
           sprite.eyeofRaBullet.displayHeight += sprite.eyeOfRaMultiplier;
           sprite.eyeofRaBullet.displayWidth += sprite.eyeOfRaMultiplier;
           sprite.eyeofRaBullet.x = sprite.x;
           sprite.eyeofRaBullet.y = sprite.y;
           //sprite.eyeofRaBullet.reset(sprite.x, sprite.y);
           // if it grows to big, start to shake screen
           if (sprite.eyeofRaBullet.displayHeight > 150) {
             game.cameras.main.shake(500, 0.01);
           }
           // if it gets waay to big, destroy the ship
           if (sprite.eyeofRaBullet.displayHeight > 200) {
             sprite.eyeofRaBullet.G.destroy(true, true);
             sprite.G.destroy(true, true);
             // sprite.destroy();
             //sprite.eyeofRaBullet.destroy();
           }
         }
         return;
       }
       
       if (game.time.now > sprite.eyeOfRaTime) {
           sprite.eyeOfRaTracking = false;
           sprite.eyeOfRaCharging = true;
           sprite.eyeOfRaTime = game.time.now + BULLET_RATE;
           //var bullet = sprite.megaBlasts.getFirstExists(false);

           let bullet = Thing.create({
             type: 'missle',
             x: sprite.x,
             y: sprite.y,
             texture: 'bullet'
           });

           sprite.eyeofRaBullet = bullet;

           bullet.weapon = true;
           // //bullet.anchor.set(0.5, 0.5);
           bullet.height = 10;
           bullet.width = 10;
           bullet.hardness = 9;
           bullet.tint = tints['blood-orange'];
           bullet.G.owner = sprite.name;
           // 

           bullet.setFriction(0, 0);
           bullet.setMass(0.01);
           // attach("hasScreenWrap",  bullet);
           Behavior.attach('hasCollisions', bullet, {
             owner: sprite,
             collidesWithSelf: false,
             collidesWithSiblings: false,
             collidesWithChildren: false,
             impacts: false,
             collisionHandler: function (thing) {
               // sprite.megaBlastDamageSFX.play();
               // console.log('EYE OF RA COLLIDES', thing.name, thing)
               thing.G.health = Math.floor(thing.G.health - BULLET_DAMAGE);
               bullet.G.destroy();
             }
           });

           if (bullet) {
             if (sprite.energy <= 0) {
               return;
             }
             if (typeof sprite.energy === "number") {
               sprite.energy -= 20;
             }

             bullet.lifespan = BULLET_LIFESPAN;
             bullet.rotation = sprite.rotation;
             // TODO: has max velocity
             bullet.maxVelocity = {
               x: 4,
               y: 4
             };

             Behavior.attach('hasLifespan', bullet, {
               lifespan: bullet.lifespan,
               callback: function () {
                 try {
                   bullet.G.destroy();
                 } catch (err) {
                   console.log('errr', err)
                 }
               }
             });
           }
       }
     } else {
       if (!sprite.eyeOfRaTracking) {
         sprite.eyeOfRaCharging = false;
         sprite.eyeOfRaMultiplier = 0;
         var bullet = sprite.eyeofRaBullet;
         if (bullet && bullet.body) {
           bullet.ftime = game.time.now;
           if (sprite.body) {
             // TODO: make config, configure scale of mass
             bullet.setMass(0.25);
             sprite.eyeOfRaTracking = true;
             bullet.thrust(0.04);
             bullet.rotation = sprite.rotation;
             bullet.maxVelocity = {
               x: 10,
               y: 10
             };
           } else {
             //game.physics.velocityFromRotation(sprite.rotation, BULLET_SPEED + 0, bullet.body.velocity);
           }
         }
       } else {
         // guide bullet by steering ship
         /* TODO: add back
         var bullet = sprite.eyeofRaBullet;
         if (typeof bullet !== 'undefined') {
           bullet.angle = sprite.angle;
           bullet.thrust(0.0034);
         }
         */
       }
     }

   }
 };
