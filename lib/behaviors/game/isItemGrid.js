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
    
    sprite.G.itemGrid.selectedIndex = 0;
    sprite.G.itemGrid.selectedItem = sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex] || null;

    if (opts.selectFrame) {
      sprite.G.itemGrid.selectFrame = opts.selectFrame;
    }

    let rows = opts.rows || 5;
    let columns = opts.columns || 5;

    sprite.G.itemGrid.frameOffsetX = opts.frameOffsetX || 0;
    sprite.G.itemGrid.frameOffsetY = opts.frameOffsetY || 0;

    let cellWidth = opts.cellWidth || 100;
    let cellHeight = opts.cellHeight || 100;
    let cellAlign = opts.cellAlign || Phaser.Display.Align.TOP_CENTER;

    sprite.G.itemGrid.group = game.add.group();

    let ACTIVE_COLOR = 0x6666ff;
    let INACTIVE_COLOR = 0xBBBBBB;
    let BORDER_COLOR = 0xCCCCCC;

    items.forEach(function(item){
      let r1;
      if (item.disabled) {
        r1 = game.add.rectangle(0, 0, 90, 90, ACTIVE_COLOR);
      } else {
        // r1 = game.add.rectangle(0, 0, 90, 90, INACTIVE_COLOR);
        if (item.text) {
          r1 = game.add.text(sprite.x, sprite.y, item.text)
          // TODO: item.textStyle
          let style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
          r1.setStyle(style);
        }
        if (item.texture) {
          r1 = game.add.sprite(sprite.x, sprite.y, item.texture)
          if (item.height && item.width) {
            r1.displayHeight = item.height;
            r1.displayWidth = item.width;
            r1.height = item.height;
            r1.width = item.width;
          } else {
          }
          r1.displayHeight = 60;
          r1.displayWidth = 80;
          r1.height = 60;
          r1.width = 80;
        }
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
        width: columns,
        height: rows,
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        position: cellAlign,
        x: sprite.x,
        y: sprite.y
    });

    let sorted = sprite.G.itemGrid.group.getChildren();
    sorted.forEach(function(button, i){
      if (button.G.item.selected) {
        sprite.G.itemGrid.selectFrame = sprite.G.itemGrid.selectFrame || game.add.rectangle(button.x, button.y, cellWidth, cellHeight, BORDER_COLOR);
        sprite.G.itemGrid.selectFrame.setDepth(0);
        sprite.G.itemGrid.selectedIndex = i;
        sprite.G.itemGrid.selectedItem = button.G.item;
      }
    });
  },
  update: function hasItemGridUpdate (sprite, game) {
    if (game.time.now > sprite.G.itemGrid.selectTime) {
      sprite.G.itemGrid.selectTime = game.time.now + 88;
    
      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && (Things[sprite.G.owner].inputs.leftKey || Things[sprite.G.owner].inputs.upKey)) {
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = false;
        if (sprite.G.itemGrid.selectedIndex > 0) {
          sprite.G.itemGrid.selectedIndex--;
        } else {
          sprite.G.itemGrid.selectedIndex = sprite.G.itemGrid.items.length - 1;
        }
        sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex].selected = true;
        // console.log('move player left', sprite.G.owner, sprite.G.itemGrid.selectedIndex)
      }

      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && (Things[sprite.G.owner].inputs.rightKey || Things[sprite.G.owner].inputs.downKey)) {
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
          sprite.G.itemGrid.selectFrame.x = button.x + sprite.G.itemGrid.frameOffsetX;
          sprite.G.itemGrid.selectFrame.y = button.y + sprite.G.itemGrid.frameOffsetY;
        }
      });
      if (Things[sprite.G.owner] && Things[sprite.G.owner].inputs && (Things[sprite.G.owner].inputs.primaryWeaponKey || Things[sprite.G.owner].inputs.confirmKey)) {
        // select the item and set itemGrid to complete / ready state
        console.log('setting index to true', sprite.G.itemGrid.selectedIndex)
        sprite.G.itemGrid.selectionConfirmed = true;
        sprite.G.itemGrid.selectFrame.setVisible(false);
      }
      sprite.G.itemGrid.selectedItem = sprite.G.itemGrid.items[sprite.G.itemGrid.selectedIndex];
    }
  }
};