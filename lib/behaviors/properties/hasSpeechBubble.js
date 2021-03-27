// hasSpeechBubble
const Thing = require('../../Geoffrey/Thing');

module.exports ={
  create: function createHasSpeechBubble (sprite, opts) {
    sprite.G.health = opts.health || 100;
    sprite.G.maxHealth = opts.maxHealth || opts.health;
    let style = { font: '20px Courier', fill: '#ccc', tabs: 132, align: 'left'};
    let speechBubble = sprite.G.speechBubble = Thing.create({
      type: 'speech-bubble',
      gameobject: 'text',
      owner: sprite.name,
      x: sprite.x,
      y: sprite.y,
      text: '...',
      style: style
    });
    
  },
  update: function updateHasSpeechBubble (sprite) {
    sprite.G.speechBubble.x = sprite.x;
    sprite.G.speechBubble.y = sprite.y;
  }
};