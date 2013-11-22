define('NpcEntity',
    ['CreatureEntity', 'createjs', 'utils','text'], function (CreatureEntity, createjs, utils,text) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this.mistakeWasMade = false;
                this.isNpc = true;
                this.placeInLine = -1;
                this._super(row, col);

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
            }
        });
    });