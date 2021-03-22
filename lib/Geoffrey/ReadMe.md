# Geoffrey

Geoffrey is a composition Behaviors based framework for Phaser.io v3+

Geoffrey helps you build complex games quickly using a simple Behaviors pattern


## Things

A "Thing" is a Phaser.io Game entity such as a sprite or group. Geoffrey can create "Things" that appear in your Game.

## Behaviors

A "Behavior" is a set of functions which are applied to a "Thing". Behaviors generally need to export at least these two functions:

### `Behavior.create()`

Called once when the Behavior is first applied to the "Thing".

### `Behavior.update()`

Called every event loop of the Game.



