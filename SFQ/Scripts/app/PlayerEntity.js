define('PlayerEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'tileManager', 'assetManager', 'utils'],
    function (createjs, CreatureEntity, text, constants, tileManager, assetManager, utils) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this._super(row, col, 0);
                this.isPlayer = true;
                this.hitPoints = 3;
                
                //Callbacks
                this.winState = $.Callbacks();
                this.loseState = $.Callbacks();
            },
            createView: function(x, y) {
                this._super(x, y);
                this.itemCountLabel.alpha = 0;

            },
            move: function (x, y) {
                if (this.isDead)
                    return;
                var newRow = this.row + y,
                    newCol = this.col + x;
                
                if (!tileManager.collisionMap[newRow][newCol] && //check for collision
                    newRow >= 0 && newRow < constants.NUM_ROWS && //check bounds
                    newCol >= 0 && newCol < constants.NUM_COLUMNS) {
                    this.setPosition(newRow, newCol);
                    assetManager.playSound('walk');
//                    this.setItemCount(); //reset items scanned
                    this.moved.fire();
                } else if (tileManager.collisionMap[newRow][newCol] && tileManager.collisionMap[newRow][newCol].isNpc) {
                    var npc = tileManager.collisionMap[newRow][newCol];
                    var that = this;
                    var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                    var destX = Math.sign(npc.view.x - this.view.x) * 10 + this.view.x,
                        destY = Math.sign(npc.view.y - this.view.y) * 10 + this.view.y;
                    createjs.Tween.get(that.view).to({ x: destX, y: destY }, 50, createjs.Ease.linear).call(function () {
                        npc.bump(that);
                        createjs.Tween.get(that.view).to({ x: orgPos.x, y: orgPos.y }, 50, createjs.Ease.linear);
                    });
                }
            },
            removeItem: function () {
                this._super();
                if (this.itemCount === 0) { //win state
                    this.winState.fire();
                }
            },
            bump: function (npc) {
                assetManager.playSound('bump');
                var that = this;
                var orgPos = utils.getAbsolutePositionByGridPosition(this.row, this.col);
                this.randomShake(orgPos, this, 6);
                this.hit();
                if (this.hitPoints == 0) {
                    this.die(function () {
                        var txt;
                        if (npc.isCop)
                            txt = text.getRandomText(text.killedByCopTexts);
                        else if (npc.isRobber) 
                            txt = text.getRandomText(text.killedByRobberTexts);
                        else 
                            txt = text.getRandomText(text.killedByNpcTexts);
                        that.loseState.fire(txt);
                    });
                }
            },
           
            randomShake: function (startPos, that, maxDelta) {
                var deltaX = Math.round(Math.random() * maxDelta) - 1;
                var deltaY = Math.round(Math.random() * maxDelta) - 1;
                createjs.Tween.get(that.view).to({ x: startPos.x + deltaX, y: startPos.y + deltaY }, 10, createjs.Ease.linear).call(
                    function () {
                        if (maxDelta > 0)
                            that.randomShake(startPos, that, maxDelta - 1);
                        else {
                            utils.resetPosition(that);
                        }
                    });
            },
            
        });
    });