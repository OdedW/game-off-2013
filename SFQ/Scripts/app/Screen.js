define('Screen',
    ['createjs', 'constants'],
    function (createjs, constants) {
        return Class.extend({
            init: function() {
                this.mainView = new createjs.Container();
                this.mainView.alpha = 0;
                this.goToMainMenuScreen = $.Callbacks();
                this.goToGameScreen = $.Callbacks();
                this.goToCreditsScreen = $.Callbacks();
                this.goToInstructionsScreen = $.Callbacks();
                this.highlightedColor = 'Khaki';
                this.unHighlightedColor = 'white';
            },
            handleKeyDown: function(e) {

            },
            handleKeyUp: function(e) {

            },
            activate: function() {

            },
            tick: function(evt) {

            },
            show: function(callback) {
                createjs.Tween.get(this.mainView).to({ alpha: 1 }, 300, createjs.Ease.quadIn).call(function() {
                    if (callback) {
                        callback();
                    }
                });
            },
            hide: function (callback) {
                createjs.Tween.get(this.mainView).to({ alpha: 0 }, 300, createjs.Ease.quadIn).call(function () {
                    if (callback) {
                        callback();
                    }
                });
            },
            createOutlinedText: function (text, fontsize, y, offset, color, outlineColor) {
                var main = new createjs.Text(text, fontsize + "px " + constants.FONT + "", color || 'white');
                main.textAlign = 'center';
                main.textBaseline = 'middle';
                main.x = constants.WORLD_WIDTH / 2;
                main.y = 0;
                var outline = new createjs.Text(text, fontsize + "px " + constants.FONT + "", outlineColor || 'gray');
                outline.textAlign = 'center';
                outline.textBaseline = 'middle';
                outline.x = constants.WORLD_WIDTH / 2 + offset;
                outline.y = offset;
                var container = new createjs.Container();
                container.x = 0;
                container.y = y;
                container.setBounds(0, y, constants.WORLD_WIDTH, fontsize);
                container.addChild(outline, main);
                container.main = main;
                container.outline = outline;
                container.regY = fontsize / 2;
                container.setText = function (txt) {
                    this.main.text = txt;
                    this.outline.text = txt;
                };
                container.setLineWidth = function(width) {
                    this.main.lineWidth = width;
                    this.outline.lineWidth = width;                    
                };
                container.setLineHeight = function (height) {
                    this.main.lineHeight = height;
                    this.outline.lineHeight = height;
                };
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, -3, constants.WORLD_WIDTH, fontsize + 6);
                container.hitArea = hit;
                return container;
            }
        });
    });