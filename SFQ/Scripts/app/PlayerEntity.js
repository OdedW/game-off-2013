define('PlayerEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'tileManager', 'assetManager'],
    function (createjs, CreatureEntity, text, constants, tileManager, assetManager) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this._super(row, col, 0);
                this.winState = $.Callbacks();
            },
            createView: function(x, y) {
                this._super(x, y);
                this.itemCountLabel.alpha = 0;

            },
            move: function (x, y) {
                var newRow = this.currentRow + y,
                    newCol = this.currentColumn + x;
                
                if (!tileManager.collisionMap[newRow][newCol] && //check for collision
                    newRow >= 0 && newRow < constants.NUM_ROWS && //check bounds
                    newCol >= 0 && newCol < constants.NUM_COLUMNS) {
                    this.setPosition(newRow, newCol);
                    assetManager.playSound('walk');
                    this.setItemCount(); //reset items scanned
                }
            },
            setItemCount: function () {
                this.initialItemCount = this.itemCount = 5;
            },
            removeItem: function () {
                this._super();
                if (this.itemCount === 0) { //win state
                    this.winState.fire();
                }
            },
        });
    });