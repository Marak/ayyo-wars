let ayyoWars = {
  // This project is awesome
  awesome: true,
  /*
  
    "Things" or "T" is the main hash which stores all Ayyo Wars objects
    Anything which appears on the screen should have a representation in Things['the-thing-name'],
    where it can be manipulated using the "Things" API found in the Ayyo Wars documentation

  */
  Thing: require('./Geoffrey/Thing'),
  Things: require('./Geoffrey/Things'),
  /*
  
    "behaviors" can be attached to "Things" in order to create Things which can behave
    Unlimited behaviors may be attached to a Thing giving it emergent and complex behaviors
  
    For example:
  
    TODO...
   
    "behaviors" are modules which contain the following four exported methods:
  
     create()
       - This is run once, when the Thing which has the behavior is created
     update()
       - This is run on every update on the game loop
     remove()
       - This is run when the Thing the behavior has been attached to is destroyed
  
  */ 
  behaviors: require('./behaviors'),
  data: {
    starmap: require('../data/stars')
  },
  scenes: {
    preloader: require('./scenes/preloader'),
    demo: require('./scenes/demo'),
    title: require('./scenes/title'),
    render: require('./scenes/render'),
    settings: {
      controls: require('./scenes/settings/controls')
    },
    skirmish: {
      battle: require('./scenes/skirmish/battle'),
      readyroom: require('./scenes/skirmish/readyroom')
    },
    galaxy: require('./scenes/galaxy')
  },
  Behavior: require('./Geoffrey/Behavior'),
  Game: require('./Geoffrey/Game'),
  inputs: require('./inputs/inputs'),
  
  // Any additional top-level methods can be added here, try not to add things to the top-level if you can!
  alert: function () {
  }
};

module.exports = ayyoWars;
