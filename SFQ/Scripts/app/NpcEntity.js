define('NpcEntity',
    ['CreatureEntity', 'createjs', 'utils', 'text', 'tileManager', 'constants', 'assetManager'],
    function (CreatureEntity, createjs, utils, text, tileManager, constants, assetManager) {
        return CreatureEntity.extend({
            init: function (row, col, index) {
                this.mistakeWasMade = false;
                this.isNpc = true;
                this.placeInLine = -1;
                this._super(row, col, index);
                this.movementSpeed = Math.floor(Math.random() * (constants.MAX_MOVEMENT_SPEED - constants.MIN_MOVEMENT_SPEED)) + constants.MIN_MOVEMENT_SPEED;
                this.shouldMove = false;
                this.movementDestination = null;
                this.timeSinceLastMove = 0;
                this.isAggresive = Math.random() < constants.CHANCE_OF_BEING_AGRESSIVE;
                this.numOfWarningsAfterLineCutting = 0;
                this.killMode = false;
                this.ignorePlayerWhenMoving = false;
                this.ignoreNpcsWhenMoving = false;

                //calbacks
                this.playerIsBlockingMove = $.Callbacks();
                this.finishedMoving = $.Callbacks();
            },
            setItemCount: function() {
                this.initialItemCount = this.itemCount = Math.floor(Math.random() * 3 + 3);
            },
            bump: function () {
                assetManager.playSound('bump');
                this.hit();
                if (this.hitPoints === 0) {
                    this.die();
                    return;
                }
                var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                this.randomShake(orgPos, this, 6);
                if (!this.killMode) {
                    this.say(text.getRandomText(text.bumpTexts));
                }
                
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
            tick: function (evt) {
                if (this.shouldMove) {
                    this.checkForDestinationReached(); //destination was point of beginning
                    this.timeSinceLastMove += evt.delta;
                    if (this.timeSinceLastMove >= this.movementSpeed) {
                        var nextCol = this.col + Math.sign(this.movementDestination.col - this.col);
                        var nextRow = this.row + Math.sign(this.movementDestination.row - this.row);
                        //check for collision
                        var creature = tileManager.collisionMap[nextRow][nextCol];
                        if (creature) //occupied
                        {
                            if (creature.isPlayer) {
                                if (!this.ignorePlayerWhenMoving) {
                                    if (this.killMode) { //hurt player
                                        var that = this;
                                        var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                                        var destX = Math.sign(creature.view.x - this.view.x) * 10 + this.view.x,
                                            destY = Math.sign(creature.view.y - this.view.y) * 10 + this.view.y;
                                        createjs.Tween.get(that.view).to({ x: destX, y: destY }, 50, createjs.Ease.linear).call(function() {
                                            creature.bump(that);
                                            createjs.Tween.get(that.view).to({ x: orgPos.x, y: orgPos.y }, 50, createjs.Ease.linear);
                                        });
                                        this.timeSinceLastMove = 0;
                                        return;
                                    } else if (nextRow === this.row) {
                                        this.playerIsBlockingMove.fire(this);
                                        this.timeSinceLastMove = 0;
                                        return; //wait in place
                                    }
                                }
                            } else if (!this.ignoreNpcsWhenMoving){
                                nextRow = this.row; //try to move horizontally
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
                        this.moved.fire(this);
                    }
                }
            },
            checkForDestinationReached: function () {
                if (this.col === this.movementDestination.col &&
                            this.row === this.movementDestination.row) {
                    this.shouldMove = false;
                    this.finishedMoving.fire(this);
                }
            },
            kill: function (creature) {
                var that = this;
                this.killMode = true;
                this.shouldMove = true;
                this.movementDestination = { row: creature.row, col: creature.col };
                if (this.itemCountLabel)
                    this.hideItemCount();
                creature.moved.add(function() {
                    that.movementDestination = { row: creature.row, col: creature.col };
                });
            },
            die: function () {
                console.log('die2');
                this.shouldMove = false;
                this._super();
                this.speechBubble.alpha = 0;
                if (this.itemCountLabel)
                    this.hideItemCount();
            }          
        });
    });