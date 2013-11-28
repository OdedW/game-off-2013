define('CreatureEntity',
    ['createjs', 'assetManager', 'BaseEntity', 'utils', 'constants', 'tileManager'],
    function (createjs, assetManager, BaseEntity, utils, constants, tileManager) {
        return BaseEntity.extend({
            init: function (row, col, index) {
                this.setItemCount();
                var creatureRow = Math.floor(Math.random() * constants.CREATURES_IN_COLUMN);
                var creatureColumn = Math.floor(Math.random() * constants.CREATURES_IN_ROW);
                var creatureIndex = creatureRow * constants.CREATURES_IN_ROW * 2 + creatureColumn;
                creatureIndex = creatureIndex === 0 ? 1 : creatureIndex;
                this.creatureIndex = index === undefined ? creatureIndex : index;
                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.row = row;
                this.col = col;
                this.hitPoints = 3;
                this.isDead = false;

                this._super(pos.x, pos.y);
                tileManager.collisionMap[this.row][this.col] = this;
                
                //callbacks
                this.moved = $.Callbacks();
                this.tookHit = $.Callbacks();
                this.died = $.Callbacks();
                this.sayingSomething = $.Callbacks();

            },
            hit: function () {
                this.hitPoints--;
                this.tookHit.fire();
            },
            setItemCount:function() {
                this.initialItemCount = this.itemCount = 0;
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
                        idle: { frames: [this.creatureIndex, this.creatureIndex + constants.CREATURES_IN_ROW], speed: animationSpeed },
                        scared: { frames: [this.creatureIndex, this.creatureIndex + constants.CREATURES_IN_ROW], speed: 0.3 },
                        still: { frames: [this.creatureIndex], speed: 0.3 }
                        
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            createView: function (x, y) {
                this.view = new createjs.Container();
                
                //speech bubble
                this.createSpeechBubble(constants.TILE_SIZE * 1.5, constants.TILE_SIZE, -constants.TILE_SIZE / 2, '10px', 12);
                
                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.avatar.regX = this.avatar.regY = this.size.w / 2;
                this.avatar.x = this.avatar.y = this.size.w / 2;
                this.view.addChild(this.avatar);
                this.view.x = x ;
                this.view.y = y;
                
                this.itemCountLabel = new createjs.Container();
                this.itemCountLabel.x = this.size.w - 5;
                this.itemCountLabel.y = this.size.h - 5;
                // this.itemCountLabel.alpha = 0;
                var circle = new createjs.Shape();
                circle.graphics.beginFill("gray").drawCircle(0, 0, 11).beginFill("black").drawCircle(0, 0, 9);
                circle.alpha = 0.7;

                this.itemCountText = new createjs.Text(this.itemCount.toString(), "14px Arial", "white");
                this.itemCountText.x = -4;
                this.itemCountText.y = -8;
                this.firstInLine = false;
                this.itemCountLabel.addChild(circle, this.itemCountText);
                this.view.addChild(this.itemCountLabel);
            },
            createSpeechBubble: function (width, height, x, fontSize, lineHeight) {
                if (this.speechBubble) {
                    this.view.removeChild(this.speechBubble);
                }
                this.speechBubbleText = new createjs.Text(this.name, fontSize + " " + constants.FONT + "", "white");
                this.speechBubbleText.lineWidth = width - 10;
                this.speechBubbleText.x = 6;
                this.speechBubbleText.y = 2;
                this.speechBubbleText.lineHeight = lineHeight;
                this.speechBubbleWidth = width;
                this.speechBubble = new createjs.Container();
                this.speechBubbleContainer = new createjs.Shape();
                this.drawBubbleAndSetY(width, height);
                this.speechBubble.alpha = 0;
                this.speechBubble.x = x;
                
                this.speechBubble.addChild(this.speechBubbleContainer, this.speechBubbleText);
                this.view.addChild(this.speechBubble);
            },
            drawBubbleAndSetY: function () {
                var height = this.speechBubbleText.getMeasuredHeight() + 10;
                this.speechBubbleContainer.graphics.clear().beginFill("gray").drawRoundRect(0, 0, this.speechBubbleWidth, height, 5)
                   .beginFill("black").drawRoundRect(2, 2, this.speechBubbleWidth - 4, height - 4, 5);
                this.speechBubble.y = -height;

            },
            tick: function(evt) {
            },
            setPosition: function (row, col) {
                //set position in collisionMap
                tileManager.collisionMap[this.row][this.col] = false;
                tileManager.collisionMap[row][col] = this;
//                if (this.isPlayer)
//                console.log('went from '+this.row+','+this.col+' to '+row+','+col);
                
                this.row = row;
                this.col = col;

                var pos = utils.getAbsolutePositionByGridPosition(row, col);
                this.view.x = pos.x;
                this.view.y = pos.y;
            },
            say: function (text, timeout, callback, dontReposition) {
                if (this.isDead)
                    return;
                this.speechBubbleText.text = text;
                this.drawBubbleAndSetY();
                if (!dontReposition) {
                    if (tileManager.collisionMap[this.row - 1][this.col] && !tileManager.collisionMap[this.row + 1][this.col]) { //someone is one square up
                        this.speechBubble.y = this.speechBubble.y * -1;
                    } 
                }

                timeout = timeout || 3000;
                var that = this;
                
                createjs.Tween.get(this.speechBubble).to({ alpha: 1 }, 100, createjs.Ease.quadIn).call(function() {
                    if (that.isDead) {
                        createjs.Tween.get(that.speechBubble).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
                    } else {
                        that.sayingSomething.fire(that);
                    }
                });
                
                if (this.speechTimeout) {
                    clearInterval(this.speechTimeout);
                }

                this.dialogCallback = callback;
                this.speechTimeout = setTimeout(function () {
                    that.endDialog.apply(that);
                }, timeout);

            },
            endDialog: function () {
                var that = this;
                var callback = this.dialogCallback;
                that.dialogCallback = null;

                createjs.Tween.get(this.speechBubble).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
                if (callback)
                    setTimeout(function () {
                        callback(that);
                    }, 100);
            },
            stopSayingSomething: function () {
                if (this.speechTimeout) {
                    clearInterval(this.speechTimeout);
                }
                this.endDialog();
            },
            removeItem: function () {
                if (this.itemCount > 0) {
                    this.itemCount--;
                    this.itemCountText.text = this.itemCount;
                }
            },
            showItemCount: function () {
                if (this.itemCountLabel.alpha === 0)
                    createjs.Tween.get(this.itemCountLabel).to({ alpha: 1 }, 100, createjs.Ease.quadIn);
            },
            hideItemCount: function () {
                if (this.itemCountLabel.alpha === 1)
                    createjs.Tween.get(this.itemCountLabel).to({ alpha: 0 }, 200, createjs.Ease.quadIn);
            },
            toggleItemCountLabel: function () {
                if (this.itemCountLabel.alpha === 1)
                    this.hideItemCount();
                else if (this.itemCountLabel.alpha === 0)
                    this.showItemCount();
            },
            die: function (callback) {
                var that = this;
                this.isDead = true;

                createjs.Tween.get(this.avatar).to({ rotation: 720 }, 1000, createjs.Ease.quadOut).call(function() {
//                    that.avatar.rotation = 0;
                });
                createjs.Tween.get(this.avatar).to({ alpha: 0 }, 1000, createjs.Ease.quadIn).call(function () {
//                    that.avatar.alpha = 1;
                });
                createjs.Tween.get(this.avatar).to({ scaleX: 0 }, 1000, createjs.Ease.quadOut).call(function () {
//                    that.avatar.scaleX = 1;
                });
                createjs.Tween.get(this.avatar).to({ scaleY: 0 }, 1000, createjs.Ease.quadOut).call(function () {
//                    that.avatar.scaleY = 1;
                });
                tileManager.collisionMap[that.row][that.col] = false; //remove from board

                setTimeout(function() {
                    that.died.fire(that);
                    if (callback)
                        callback();
                }, 500);
            }
        });
});