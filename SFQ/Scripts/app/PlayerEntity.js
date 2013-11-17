define('PlayerEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'tileManager', 'assetManager'],
    function (createjs, CreatureEntity, text, constants, tileManager, assetManager) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this._super(row, col, 0);
            },
            move: function (x, y) {
                var newRow = this.currentRow + y,
                    newCol = this.currentColumn + x;
                
                if (!tileManager.collisionMap[newRow][newCol] && //check for collision
                    newRow >= 0 && newRow < constants.NUM_ROWS && //check bounds
                    newCol >= 0 && newCol < constants.NUM_COLUMNS) {
                    this.setPosition(newRow, newCol);
                    assetManager.playSound('walk');
                }
            }
        });
    });