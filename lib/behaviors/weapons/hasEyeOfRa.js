//  hasEyeOfRa
const Thing = require('../../Geoffrey/Thing');
const Behavior = require('../../Geoffrey/Behavior');
const tints = require('../../utils/tints');

module.exports = {
   config: {
     BULLET_LIFESPAN: 12500,
     BULLET_RATE: 999,
     THRUST_FORCE: 0.04,
     BULLET_DAMAGE: 22
   },
   tags: ['weapon', 'offensive', 'long-range'],
   lore: {
     name: 'Eye of Ra',
     symbol: 'ER',
     flavor: ''
   },
   create: function createEyeOfRa (sprite, opts) {
     sprite.G.eyeOfRaTime = 0;
     sprite.G.eyeOfRaControlKey = opts.controlKey || 'primaryWeaponKey';
     sprite.G.eyeOfRaCharging = false;
     sprite.G.eyeOfRaTracking = false;
     sprite.G.eyeOfRaMultiplier = 0;
   },
   update: function updateEyeOfRa (sprite, game, config) {

     if ((sprite.inputs && sprite.inputs[sprite.G.eyeOfRaControlKey]) /*|| sprite.autofire*/) {
       if (sprite.G.eyeOfRaCharging) {
         sprite.G.eyeOfRaTracking = false;
         // TODO: make sure to destroy or do something with eye of ra is ship is destroyed....perhaps fire it as is?
         if (sprite.G.eyeofRaBullet) {
           // bullet.angle = sprite.angle;
           sprite.G.eyeOfRaMultiplier = 0.33;
           sprite.G.eyeofRaBullet.displayHeight += sprite.G.eyeOfRaMultiplier;
           sprite.G.eyeofRaBullet.displayWidth += sprite.G.eyeOfRaMultiplier;
           sprite.G.eyeofRaBullet.x = sprite.x;
           sprite.G.eyeofRaBullet.y = sprite.y;
           sprite.G.eyeofRaBullet.rotation = sprite.rotation;
           //sprite.eyeofRaBullet.reset(sprite.x, sprite.y);
           // if it grows to big, start to shake screen
           if (sprite.G.eyeofRaBullet.displayHeight > 150) {
             game.cameras.main.shake(500, 0.01);
           }
           // if it gets waay to big, destroy the ship
           if (sprite.G.eyeofRaBullet.displayHeight > 200) {
             sprite.G.eyeofRaBullet.G.destroy(true, true);
             sprite.G.destroy(true, true);
             // sprite.destroy();
             //sprite.eyeofRaBullet.destroy();
           }
         }
         return;
       }
       
       if (game.time.now > sprite.G.eyeOfRaTime) {
           sprite.G.eyeOfRaTracking = false;
           sprite.G.eyeOfRaCharging = true;
           sprite.G.eyeOfRaTime = game.time.now + config.BULLET_RATE;
           //var bullet = sprite.megaBlasts.getFirstExists(false);

           let bullet = Thing.create({
             type: 'missle',
             x: sprite.x,
             y: sprite.y,
             texture: 'bullet'
           });

           sprite.G.eyeofRaBullet = bullet;

           bullet.height = 10;
           bullet.width = 10;
           bullet.tint = tints['blood-orange'];
           bullet.G.hardness = 9;
           bullet.G.owner = sprite.name;

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
               thing.G.health = Math.floor(thing.G.health - config.BULLET_DAMAGE);
               bullet.G.destroy();
             }
           });

           if (bullet) {
             if (sprite.G.energy <= 0) {
               return;
             }
             if (typeof sprite.G.energy === "number") {
               sprite.G.energy -= 20;
             }

             bullet.G.lifespan = config.BULLET_LIFESPAN;
             bullet.rotation = sprite.rotation;
             // TODO: has max velocity
             bullet.G.maxVelocity = {
               x: 4,
               y: 4
             };

             Behavior.attach('hasLifespan', bullet, {
               lifespan: bullet.G.lifespan,
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
       if (!sprite.G.eyeOfRaTracking) {
         sprite.G.eyeOfRaCharging = false;
         sprite.G.eyeOfRaMultiplier = 0;
         var bullet = sprite.G.eyeofRaBullet;
         if (bullet && bullet.body) {
           bullet.ftime = game.time.now;
           if (sprite.body) {
             // TODO: make config, configure scale of mass
             bullet.setMass(0.25);
             sprite.G.eyeOfRaTracking = true;
             bullet.thrust(config.THRUST_FORCE);
             bullet.rotation = sprite.rotation;
             bullet.maxVelocity = {
               x: 10,
               y: 10
             };
           } else {
             //game.physics.velocityFromRotation(sprite.rotation, config.BULLET_SPEED + 0, bullet.body.velocity);
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
