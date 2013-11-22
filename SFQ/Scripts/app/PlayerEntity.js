define('PlayerEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'tileManager', 'assetManager', 'utils'],
    function (createjs, CreatureEntity, text, constants, tileManager, assetManager, utils) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this._super(row, col, 0);
                this.winState = $.Callbacks();
                this.moved = $.Callbacks();
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
                    this.moved.fire();
                } else if (tileManager.collisionMap[newRow][newCol].isNpc) {
                    var npc = tileManager.collisionMap[newRow][newCol];
                    var that = this;
                    var orgPos = utils.getAbsolutePositionByGridPosition(this.currentRow, this.currentColumn);
                    var destX = Math.sign(npc.view.x - this.view.x) * 10 + this.view.x,
                        destY = Math.sign(npc.view.y - this.view.y) * 10 + this.view.y;
                    createjs.Tween.get(that.view).to({ x: destX, y: destY }, 50, createjs.Ease.linear).call(function () {
                        assetManager.playSound('bump');
                        npc.bump();
                        createjs.Tween.get(that.view).to({ x: orgPos.x, y: orgPos.y }, 50, createjs.Ease.linear);
                    });
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