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
                this.createSpeechBubble(constants.TILE_SIZE * 2, constants.TILE_SIZE*2, -constants.TILE_SIZE /2, '13px', 15);

                this.avatar = new createjs.Sprite(this.spriteSheet, 'idle');
                this.avatar.regX = this.avatar.regY = this.size.w / 2;
                this.avatar.x = this.avatar.y = this.size.w / 2;
                this.view.addChild(this.avatar);
                this.view.x = x;
                this.view.y = y;
            },
            say:function(txt, timeout, callback) {
                this._super(txt, timeout || 5000, callback, true);
            }

        });
    });