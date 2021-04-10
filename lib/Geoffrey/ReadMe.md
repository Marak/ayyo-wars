# Geoffrey

Geoffrey is a composition Behaviors based framework for Phaser.io v3+

Geoffrey helps you build complex games quickly using a simple Behaviors pattern

## Features

  - Manage and create game entities as "Things"
  - Handle client Inputs
  - Customizable collision handler
  - Optional Authortative Server
    - Client-Side Prediction
    - UDP via WebRTC
    - Snapshot Interpolation


### Functional Composition over Object Inheritance

Geoffrey utilizes a dependency injection pattern where each game object starts out as an empty `Thing` which can have `Behaviors` `attached to it. Think of it as a [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science)) approach for defining game objects and behaviors instead of an [object inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)).

## Things

A "Thing" is a Phaser.io Game entity such as a sprite or group. Geoffrey can create "Things" that appear in your Game.

## Behaviors

A "Behavior" is a set of functions which are applied to a "Thing". Behaviors can export these properties:

### `Behavior.config`

Used as default configuration scope for values used inside the Behavior

### `Behavior.create()`

Called once when the Behavior is first applied to the "Thing".

### `Behavior.update()`

Called every event loop of the Game.

### `Behavior.remove()`

Called when the Behavior is detached.



