module.exports = function findBestTarget (sprite) {
  var target = null;
  var closest = 9999;

  var closestPlayer = 9999;
  var closestTarget = 9999;
  let game = sprite.scene;
  let T = game.Things;

  // TODO: If previous target is still alive, do not reassign a new target unless a small window has passed
  if (sprite.lastTargetName && T[sprite.lastTargetName]) {
    if (game.time.now - sprite.lastTargetTime < 200) {
      return T[sprite.lastTargetName];
    }
  }

  var target = null;
  for (var thing in T) {
    // Do not target our own ship
    if (T[thing].name === sprite.name) {
      continue;
    }
    // Do not target sprites our ship owns
    if (T[thing].owner === sprite.name) {
      continue;
    }
    if (T[thing].destructable === false) {
      continue;
    }

//    if (typeof T[thing].health !== 'undefined') {
      // If the thing has health
      // console.log(thing, T[thing])
      //T[thing].setVelocity(T[thing].ogSpeed);

      // TODO: check first for closest player in range
      // TODO: use closestArr to store 10 closest items, then sort by distance. pick the closest player
      // TODO: provide an option / key control to adjust the targeting system of the laser beam
      //       if none found, find closest object in range

      // If the thing is a player or is destructable
//      if (T[thing].player || T[thing].destructable) {
        var d1 = Phaser.Math.Distance.Between(sprite.x, sprite.y, T[thing].x, T[thing].y);
        if (d1 < closest) {
          closest = d1;
          target = T[thing];
        }
//      }
//    }
  }
  
  // console.log('ttt', target.name)
  /*
  if (target.name !== sprite.lastTargetName) {
    $('.zoomStatus').append('new target', target.name, '\n');
  }
  */
  //console.log('new target', target.name)
  sprite.lastTargetName = target.name;
  sprite.lastTargetTime = game.time.now;
  return target;
}