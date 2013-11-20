define('CashierEntity',
    ['createjs', 'CreatureEntity', 'text', 'constants', 'assetManager'], function (createjs, CreatureEntity, text, constants, assetManager) {
        return CreatureEntity.extend({
            init: function (row, col) {
                this.name = text.getCashierName(9);
                this.score = Math.round(Math.random() * 2 + 14);
                this.accuracy = Math.round(Math.random() * 5 + 5);
                this.speed = this.score - this.accuracy;
                this._super(row, col);
                this.speechBubble.x = this.speechBubble.x = constants.TILE_SIZE;
                this.speechBubble.y = 0;
            },
            createSpriteSheet: function () {
                var animationSpeed = Math.random() * 0.04 + 0.06;
                var data = {
                    images: [assetManager.images.cashier],
                    frames: { width: this.size.w, height: this.size.h },
                    animations: {
                        idle: { frames: [0, 1], speed: animationSpeed }
                    }
                };
                this.spriteSheet = new createjs.SpriteSheet(data);
            },
            showDescription: function () {
                if (this.description.alpha === 0)
                    createjs.Tween.get(this.description).to({ alpha: 1 }, 100, createjs.Ease.quadIn);
            },
            hideDescription: function () {
                if (this.description.alpha === 1)
                    createjs.Tween.get(this.description).to({ alpha: 0 }, 100, createjs.Ease.quadIn);
            },
            toggleDescription: function () {
                if (this.description.alpha === 1)
                    this.hideDescription();
                else if (this.description.alpha === 0)
                    this.showDescription();
            },
            createView: function (x, y) {
                this._super(x, y);

                this.description = new createjs.Container();
                this.description.x = this.size.w + 5;
                this.description.y = 5;
                this.description.alpha = 0;
                var rect = new createjs.Shape();
                rect.graphics.beginFill("gray").drawRoundRect(0, 0, constants.TILE_SIZE * 1.75, constants.TILE_SIZE * 1.75, 5)
                .beginFill("black").drawRoundRect(2, 2, constants.TILE_SIZE * 1.75 - 4, constants.TILE_SIZE * 1.75 - 4, 5);
                rect.alpha = 0.8;

                var nameLabel = new createjs.Text(this.name, "10px " + constants.FONT + " ", "white");
                nameLabel.x = 6;
                nameLabel.y = 6;

                var speedLabel = new createjs.Text('Speed: ' + this.speed, "9px " + constants.FONT, "white");
                speedLabel.x = 6;
                speedLabel.y = 30;

                var accuracyLabel = new createjs.Text('Accuracy: ' + this.accuracy, "9px " + constants.FONT, "white");
                accuracyLabel.x = 6;
                accuracyLabel.y = 54;

                this.description.addChild(rect, nameLabel, accuracyLabel, speedLabel);

                var that = this;
                this.avatar.addEventListener("mouseover", function () {
                    that.showDescription();
                });
                this.avatar.addEventListener("mouseout", function () {
                    that.hideDescription();
                });

                this.view.addChild(this.description);
                this.view.mouseEnabled = true;

                this.itemCountLabel.alpha = 0;
            }

        });
    });