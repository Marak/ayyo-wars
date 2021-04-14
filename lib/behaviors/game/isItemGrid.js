const Things = require('../../Geoffrey/Things');

// hasItemGrid
module.exports = {
  config: {
    stack: 0
  },
  create: function hasItemGridCreate (sprite, opts, game) {
    
    sprite.G.itemGrid = sprite.G.itemGrid || {};
    sprite.G.itemGrid.selectTime = 0;
    let items = sprite.G.itemGrid.items = sprite.G.itemGrid.items || opts.items || [];
    
    sprite.G.itemGrid.group = game.add.group();

    let ACTIVE_COLOR = 0x6666ff;
    let INACTIVE_COLOR = 0xBBBBBB;
    let BORDER_COLOR = 0x11FFFF;

    items.forEach(function(item){
      let r1;
      if (item.disabled) {
        r1 = game.add.rectangle(0, 0, 90, 90, ACTIVE_COLOR);
        //r1 = game.add.sprite(sprite.x, sprite.y, item.texture)
      } else {
        // r1 = game.add.rectangle(0, 0, 90, 90, INACTIVE_COLOR);
        r1 = game.add.sprite(sprite.x, sprite.y, item.texture)
      }
      r1.setDepth(10);
      r1.G = {
        item: item
      };
      /*
      if (item.texture) {
        let t1 = game.add.sprite(sprite.x, sprite.y, item.texture)
        t1.displayWidth = sprite.displayHeight * 0.9;
        t1.displayHeight = sprite.displayWidth * 0.9;
      }
      */
      sprite.G.itemGrid.group.add(r1);
    });
    
    Phaser.Actions.GridAlign(sprite.G.itemGrid.group.getChildren(), {
        width: 5,
        height: 5,
        cellWidth: 120,
        cellHeight: 120,
        x: sprite.x,
        y: sprite.y
    });

    let sorted = sprite.G.itemGrid.group.getChildren();
    sorted.forEach(function(button, i){
      if (button.G.item.selected) {
        sprite.G.itemGrid.selectFrame = game.add.rectangle(button.x, button.y, 75, 75, 0xff6200);
        sprite.G.itemGrid.selectFrame.setDepth(0);
        sprite.G.itemGrid.selectedIndex = i;
        sprite.G.itemGrid.selectedItem = button.G.item;
      }
    });
  },
  update: function hasItemGridUpdate (sprite, game) {
    if (game.time.now > sprite.G.itemGrid.selectTime) {
      sprite.G.itemGrid.selectTime = game.time.now + 88;
    
      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && Things[sprite.G.owner].inputs.leftKey) {
        console.log('hasItemGridUpdate', sprite.name)
        
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = false;
        if (sprite.G.itemGrid.selectedIndex > 0) {
          sprite.G.itemGrid.selectedIndex--;
        } else {
          sprite.G.itemGrid.selectedIndex = sprite.G.itemGrid.items.length - 1;
        }
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = true;
        // console.log('move player left', sprite.G.owner, sprite.G.itemGrid.selectedIndex)
      }

      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && Things[sprite.G.owner].inputs.rightKey) {
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = false;
        if (sprite.G.itemGrid.selectedIndex < sprite.G.itemGrid.items.length - 1) {
          sprite.G.itemGrid.selectedIndex++;
        } else {
          sprite.G.itemGrid.selectedIndex = 0;
        }
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = true;
        // console.log('move player right', sprite.G.owner, sprite.G.itemGrid.selectedIndex, sprite.name)
      }

      // TODO: add up and down key support
      let sorted = sprite.G.itemGrid.group.getChildren();
      sorted.forEach(function(button, i){
        if (button.G.item.selected) {
          sprite.G.itemGrid.selectFrame.x = button.x;
          sprite.G.itemGrid.selectFrame.y = button.y;
        }
      });
      
      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && Things[sprite.G.owner].inputs.primaryWeaponKey) {
        // select the item and set itemGrid to complete / ready state
        console.log('setting index to true', sprite.G.itemGrid.selectedIndex)
        sprite.G.itemGrid.selectionConfirmed = true;
        sprite.G.itemGrid.selectFrame.setVisible(false);
      }
      sprite.G.itemGrid.selectedItem = sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex];
    }
    
  }
};