define('RobberEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'assetManager', 'NpcEntity'], function (createjs, CreatureEntity, text, constants, assetManager, NpcEntity) {
        return NpcEntity.extend({
            init: function () {
                this._super(5, 14);
                this.hitPoints = 9;

            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.robber],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [0, 1], speed: animationSpeed },
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            createView: function (x, y) {
                this.view = new createjs.Container();

                //speech bubble
                this.speechBubble = new createjs.Container();
                this.speechBubbleContainer = new createjs.Shape();
                this.speechBubbleContainer.graphics.beginFill("gray").drawRoundRect(0, 0, constants.TILE_SIZE * 2, constants.TILE_SIZE*1.5 , 5)
                    .beginFill("black").drawRoundRect(2, 2, constants.TILE_SIZE * 2 - 4, constants.TILE_SIZE * 1.5 - 4, 5);
                this.speechBubble.alpha = 0;
                this.speechBubble.x = -constants.TILE_SIZE/2;
                this.speechBubble.y = -constants.TILE_SIZE * 1.5;
                this.speechBubbleText = new createjs.Text(this.name, "13px " + constants.FONT + "", "white");
                this.speechBubbleText.lineWidth = constants.TILE_SIZE * 2 - 10;
                this.speechBubbleText.x = 6;
                this.speechBubbleText.y = 2;
                this.speechBubble.addChild(this.speechBubbleContainer, this.speechBubbleText);
                this.view.addChild(this.speechBubble);

                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.avatar.regX = this.avatar.regY = this.size.w / 2;
                this.avatar.x = this.avatar.y = this.size.w / 2;
                this.view.addChild(this.avatar);
                this.view.x = x;
                this.view.y = y;
            },
            say:function(txt, timeout, callback) {
                this._super(txt, timeout || 3000, callback, true);
            }

        });
    });