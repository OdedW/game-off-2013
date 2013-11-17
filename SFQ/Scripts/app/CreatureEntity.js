define('CreatureEntity',
    ['createjs', 'assetManager', 'BaseEntity', 'utils', 'constants', 'tileManager'],
    function (createjs, assetManager, BaseEntity, utils, constants, tileManager) {
        return BaseEntity.extend({
            init: function (row, col, index) {
                var creatureRow = Math.floor(Math.random() * constants.CREATURES_IN_COLUMN);
                var creatureColumn = Math.floor(Math.random() * constants.CREATURES_IN_ROW);
                var creatureIndex = creatureRow * constants.CREATURES_IN_ROW * 2 + creatureColumn;
                creatreIndex = creatureIndex === 0 ? 1 : creatureIndex;
                this.creatureIndex = index === undefined ? creatureIndex : index;
                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.currentRow = row;
                this.currentColumn = col;
                this.movementSpeed = Math.floor(Math.random() * (constants.MAX_MOVEMENT_SPEED - constants.MIN_MOVEMENT_SPEED)) + constants.MIN_MOVEMENT_SPEED;
                this.shouldMove = false;
                this.movementDestination = null;
                this.timeSinceLastMove = 0;
                this._super(pos.x, pos.y);
                this.finishedMoving = $.Callbacks();
                tileManager.collisionMap[this.currentRow][this.currentColumn] = true;
            },
            setSize: function () {
                this.size = { w: 48, h: 48 };
            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.creatures],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [this.creatureIndex, this.creatureIndex + constants.CREATURES_IN_ROW], speed: animationSpeed }
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            createView: function (x, y) {
                this.view = new createjs.Container();
                
                //speech bubble
                this.speechBubble = new createjs.Container();
                this.speechBubbleContainer = new createjs.Shape();
                this.speechBubbleContainer.graphics.beginFill("gray").drawRoundRect(0, 0, constants.TILE_SIZE * 1.5, constants.TILE_SIZE * 1, 5)
                .beginFill("black").drawRoundRect(2, 2, constants.TILE_SIZE * 1.5 - 4, constants.TILE_SIZE * 1 - 4, 5);
                this.speechBubble.alpha = 0;
                this.speechBubble.x = -constants.TILE_SIZE/2;
                this.speechBubble.y = -constants.TILE_SIZE;
                this.speechBubbleText = new createjs.Text(this.name, "9px " + constants.FONT + "", "white");
                this.speechBubbleText.lineWidth = constants.TILE_SIZE * 1.5 - 10;
                this.speechBubbleText.x = 6;
                this.speechBubbleText.y = 2;
                this.speechBubbleText.text = 'testing testing one two three';
                this.speechBubble.addChild(this.speechBubbleContainer, this.speechBubbleText);
                this.view.addChild(this.speechBubble);
                
                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.view.addChild(this.avatar);
                this.view.x = x;
                this.view.y = y;
            },
            tick: function (evt) {
                if (this.shouldMove) {
                    this.timeSinceLastMove += evt.delta;
                    if (this.timeSinceLastMove >= this.movementSpeed) {
                        var nextCol = this.currentColumn + Math.sign(this.movementDestination.col - this.currentColumn);
                        var nextRow = this.currentRow + Math.sign(this.movementDestination.row - this.currentRow);
                        //check for collision
                        if (tileManager.collisionMap[nextRow][nextCol]) //occupied
                        {
                            nextRow = this.currentRow; //try to move horizontally
                            if (tileManager.collisionMap[nextRow][nextCol]) //occupied
                            {
                                this.timeSinceLastMove = 0;
                                return; //wait in place
                            }
                        }
                        this.setPosition(nextRow, nextCol);
                        this.timeSinceLastMove = 0;
                        if (this.currentColumn === this.movementDestination.col &&
                            this.currentRow === this.movementDestination.row) {
                            this.shouldMove = false;
                            this.finishedMoving.fire();
                        }
                    }
                }
            },
            setPosition: function (row, col) {
                //set position in collisionMap
                tileManager.collisionMap[this.currentRow][this.currentColumn] = false;
                tileManager.collisionMap[row][col] = true;

                this.currentRow = row;
                this.currentColumn = col;

                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.view.x = pos.x;
                this.view.y = pos.y;
            },
            say: function (text, callback, timeout) {
                timeout = timeout || 3000;
                this.speechBubbleText.text = text;
                var that = this;
                createjs.Tween.get(this.speechBubble).to({ alpha: 1 }, 100, createjs.Ease.quadIn);
                setTimeout(function () {
                    createjs.Tween.get(that.speechBubble).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
                    if (callback)
                        setTimeout(function () {
                            callback(that);
                        }, 100);
                }, timeout);

            }
        });
});