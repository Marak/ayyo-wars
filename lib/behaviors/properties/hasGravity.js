// hasGravity
module.exports ={
  create: function hasGravityCreate (sprite, opts, game) {
    //game.matter.system.enableAttractorPlugin();
    game.matter.world.setBounds();
    // create a new object representing gravitational pull ( for now )
    // TODO: it would probably be better if we could modify the existing sprite to have this instead
    var gravityWell = game.matter.add.sprite(sprite.x, sprite.y, 'mib-caddy', null, {
      isStatic: true,
      shape: {
        type: 'circle',
        radius: 64
      },
      plugin: {
        attractors: [
                function (bodyA, bodyB) {
                    return {
                        x: (bodyA.position.x - bodyB.position.x) * 0.000001,
                        y: (bodyA.position.y - bodyB.position.y) * 0.000001
                    };
                }
            ]
      }
    });
    gravityWell.setMass(15000);
    sprite.gravityWell = gravityWell;
    
    Behavior.attach('hasCollisions', gravityWell, {
      owner: sprite,
      collidesWithSelf: false, // TODO: not supported yet?
      collidesWithSiblings: true,
      collidesWithChildren: true,
      collisionHandler: function (thing) {
        if (typeof thing.hardness !== 'undefined' && thing.hardness > 7) { // TODO: b.hardness instead of 7
          // do nothing
          console.log('not hard enough');
        } else {
          // console.log(T[thing].name)
          //thing.G.health -= BULLET_STRENGTH;
          //bullet.G.destroy();
        }
      }
    });
    
  },
  update: function hasGravityUpdate (sprite) {
    //sprite.gravityWell.setVelocity(0, 0);
  }
};
