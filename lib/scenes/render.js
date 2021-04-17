var RenderScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function RenderScene ()
    {
        Phaser.Scene.call(this, { key: 'renderScene', active: false });

        this.rt;
    },

    create: function ()
    {
        //  Hide the Game Scene so it doesn't render (as we don't need it rendering twice)
        this.scene.setVisible(false, 'gameScene');

        this.rt = this.make.renderTexture({ x: 0, y: 0, width: 800, height: 600 }, false);

        this.rt.saveTexture('game');

        const mesh = this.add.mesh(400, 300, 'game');

        Phaser.Geom.Mesh.GenerateGridVerts({
            mesh,
            widthSegments: 6
        });

        mesh.hideCCW = false;
        mesh.modelRotation.set(2.604, 0.427, 0);
        mesh.viewPosition.set(0, 0, 2.833);

        const rotateRate = 1;
        const panRate = 1;
        const zoomRate = 4;

        window.mesh = mesh;

        this.add.text(16, 16, 'Drag mouse to Rotate (+ Shift to pan)\nWheel to zoom');

        this.input.on('pointermove', pointer => {

            if (!pointer.isDown)
            {
                return;
            }

            if (!pointer.event.shiftKey)
            {
                mesh.modelRotation.y += pointer.velocity.x * (rotateRate / 800);
                mesh.modelRotation.x += pointer.velocity.y * (rotateRate / 600);
            }
            else
            {
                mesh.panX(pointer.velocity.x * (panRate / 800));
                mesh.panY(pointer.velocity.y * (panRate / 600));
            }

        });

        this.input.on('wheel', (pointer, over, deltaX, deltaY, deltaZ) => {

            mesh.panZ(deltaY * (zoomRate / 600));

        });
    },

    update: function (time, delta)
    {
        var gameScene = this.scene.get('demo');

        this.rt.clear();

        this.rt.draw(gameScene.children, 0, 0);
    }

});

module.exports = RenderScene;