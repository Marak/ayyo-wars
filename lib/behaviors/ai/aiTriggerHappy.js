// aiTriggerHappy
// always is firing primary weapon no matter what
module.exports = {
  tags: ['ai'],
  stack: 0,
  create: function createAiTriggerHappy (sprite, opts) {
  },
  update: function updateAiTriggerHappy (sprite, game) {
    // TODO: invert control of AI and inputs
    // AI should only set state of sprite.brain, and sprite itself should react
    // sprite.brain = sprite.brain || {};
    // sprite.brain.triggerHappy = true;
    // TODO: remove
    sprite.inputs['primaryWeaponKey'] = true;
  },
  remove: function aiTriggerHappyRemove (sprite) {
  }
};
