module.exports = {
  create: function createHasCollisions (sprite, opts) {
    if (typeof opts.collisionHandler === 'undefined') {
      // throw new Error('opts.collisionHandler is required!');
    }
    if (opts.collidesWithSelf) {
      sprite.collidesWithSelf = opts.collidesWithSelf;
    }
    if (opts.collidesWithSiblings) {
      sprite.collidesWithSiblings = opts.collidesWithSiblings;
    }
    if (opts.collidesWithChildren) {
      sprite.collidesWithChildren = opts.collidesWithChildren;
    }
    if (opts.beforeCollisionCheck) {
      sprite.beforeCollisionCheck = opts.beforeCollisionCheck;
    }
    if (opts.collisionHandler) {
      sprite.collisionHandler = opts.collisionHandler;
    }
    if (opts.additionalCollisionCheck) {
      sprite.additionalCollisionCheck = opts.additionalCollisionCheck;
    }
    if (typeof opts.impacts !== 'undefined') {
      sprite.impacts = opts.impacts;
    }
  },
  update: function updateHasCollisions (sprite, game) {
  },
  remove: function removeHasCollisions (sprite) {
  }
};

