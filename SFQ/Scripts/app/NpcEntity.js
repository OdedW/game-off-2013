define('NpcEntity',
    ['CreatureEntity', 'createjs', 'utils', 'text', 'tileManager', 'constants'],
    function (CreatureEntity, createjs, utils, text, tileManager, constants) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this.mistakeWasMade = false;
                this.isNpc = true;
                this.placeInLine = -1;
                this._super(row, col);
                this.movementSpeed = Math.floor(Math.random() * (constants.MAX_MOVEMENT_SPEED - constants.MIN_MOVEMENT_SPEED)) + constants.MIN_MOVEMENT_SPEED;
                this.shouldMove = false;
                this.movementDestination = null;
                this.timeSinceLastMove = 0;
                
                //calbacks
                this.playerIsBlockingMove = $.Callbacks();
                this.finishedMoving = $.Callbacks();
            },
            createView: function (x, y) {
                this._super(x, y);
            },
            setItemCount: function() {
                this.initialItemCount = this.itemCount = Math.floor(Math.random() * 3 + 3);
            },
            bump: function () {
                var orgPos = utils.getAbsolutePositionByGridPosition(this.currentRow, this.currentColumn);
                this.randomShake(orgPos, this, 6);
                this.say(text.getRandomText(text.bumpTexts));
            },
            randomShake: function (startPos, that,maxDelta) {
                var deltaX = Math.round(Math.random() * maxDelta) - 1;
                var deltaY = Math.round(Math.random() * maxDelta) - 1;
                createjs.Tween.get(that.view).to({ x: startPos.x + deltaX, y: startPos.y + deltaY }, 10, createjs.Ease.linear).call(
                    function () {
                        if (maxDelta > 0 &&
                            (!that.shouldMove || that.timeSinceLastMove < that.movementSpeed)) //not currently moving
                            that.randomShake(startPos, that, maxDelta - 1);
                        else {
                            utils.resetPosition(that);
                        }
                    });
            },
            tick: function(evt) {
                if (this.shouldMove) {
                    this.checkForDestinationReached(); //destination was point of beginning
                    this.timeSinceLastMove += evt.delta;
                    if (this.timeSinceLastMove >= this.movementSpeed) {
                        var nextCol = this.currentColumn + Math.sign(this.movementDestination.col - this.currentColumn);
                        var nextRow = this.currentRow + Math.sign(this.movementDestination.row - this.currentRow);
                        //check for collision
                        if (tileManager.collisionMap[nextRow][nextCol]) //occupied
                        {
                            if (nextRow == this.currentRow &&
                                tileManager.collisionMap[nextRow][nextCol].isPlayer) {
                                console.log('pre');
                                this.playerIsBlockingMove.fire(this);
                                this.timeSinceLastMove = 0;
                                return; //wait in place

                            } else {
                                nextRow = this.currentRow; //try to move horizontally
                                if (tileManager.collisionMap[nextRow][nextCol]) //occupied
                                {
                                    this.timeSinceLastMove = 0;
                                    return; //wait in place
                                }
                            }
                        }
                        this.setPosition(nextRow, nextCol);
                        this.timeSinceLastMove = 0;
                        this.checkForDestinationReached(); //destination reached
                    }
                }
            },
            checkForDestinationReached: function () {
                if (this.currentColumn === this.movementDestination.col &&
                            this.currentRow === this.movementDestination.row) {
                    this.shouldMove = false;
                    this.finishedMoving.fire();
                }
            },
            
        });
    });