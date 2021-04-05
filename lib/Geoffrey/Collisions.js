module.exports = function globalCollisionHandler (event) {
  // Remark: Only use event argument and event.pairs value
  //console.log('collision event', event);
  //console.log('collision pairs', pairs);
  // console.log("COLLIDES", event.pairs)
  var pairs = event.pairs;
  // TODO: port hasCollisions behavior code here...central collision detector...
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var t1 = pair.bodyA.gameObject;
    var t2 = pair.bodyB.gameObject;

    // handle sensor collisions first
    if (pair.isSensor) {
      var bodyA = pair.bodyA;
      var bodyB = pair.bodyB;
      if (pair.bodyA.gameObject !== null && pair.bodyB.gameObject !== null) {
        pair.bodyA.gameObject.touching = pair.bodyA.gameObject.touching || {};
        pair.bodyB.gameObject.touching = pair.bodyB.gameObject.touching || {};
        // console.log('sensor hit', pair, bodyA.label, bodyB.label);
        if (bodyA.label === 'bottom' || bodyB.label === 'bottom') {
          pair.bodyA.gameObject.touching.bottom = true;
          pair.bodyB.gameObject.touching.bottom = true;
          pair.bodyA.gameObject.jumping = false;
          pair.bodyB.gameObject.jumping = false;
        }
        // continue;
      }
    }
    
    //console.log('collides', t1.name, t2.name)
    //return;
    if (t1 === null || t2 === null) {
      continue;
    }

    if (!t1.G  || !t2.G) {
      continue;
    }

    // console.log(t1.name, t2.owner)
    // collides with self
    if (t1.name === t2.name) {
      pair.isActive = false;
    }
    // console.log(t1, t2)
    if (t1.skipCollision || t2.skipCollision) {
      pair.isActive = false;
      // continue;
    }
    if (t1.beforeCollisionCheck) {
      t1.beforeCollisionCheck(t2, pair);
    }
    if (t2.beforeCollisionCheck) {
      t2.beforeCollisionCheck(t1, pair);
    }
    //
    // Collides with parent
    //
    if (t1.name === t2.G.owner) {
      pair.isActive = false;
      // continue;
    }
    if (t1.G.owner === t2.name) {
      pair.isActive = false;
      // continue;
    }

    //
    // Collides with siblings
    //
    if (typeof t1.G.owner !== 'undefined' && t1.G.owner === t2.G.owner) {
      pair.isActive = false;
      // continue;
    }
    // console.log('COLLISIONS', pair.isActive, t1.G, t2.G)
    // console.log('pppp', pair.isActive)
    if (pair.isActive) {
      if (t1.collisionHandler) {
        t1.collisionHandler(t2, pair);
      }
      if (t2.collisionHandler) {
        t2.collisionHandler(t1, pair);
      }

      if (t1.G.impacts === false || t2.G.impacts === false) {
        pair.isActive = false;
        // continue;
      }
    }

    if (t1.additionalCollisionCheck) {
      t1.additionalCollisionCheck(t2, t1);
    }

    if (t2.additionalCollisionCheck) {
      t2.additionalCollisionCheck(t1, t2);
    }
  }
};