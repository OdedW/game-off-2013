define('MainMenuScreen',
    ['MenuScreen', 'createjs', 'constants', 'assetManager'], function (MenuScreen, createjs, constants, assetManager) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                
                this.menuItems = [];

                this.currentHighlightedItem = 0;
                this.title = this.createOutlinedText('Super Fantasy Queue', 40, constants.WORLD_HEIGHT / 2, 4);
                this.playCampaignItem = this.createOutlinedText('Campaign', 18, 230, 2, this.highlightedColor);
                this.playCampaignItem.alpha = 0;
                this.menuItems.push(this.playCampaignItem);
                this.playEndlessModeItem = this.createOutlinedText('Endless mode (coming soon)', 18, 270, 2, 'gray', 'black');
                this.playEndlessModeItem.alpha = 0;
                this.menuItems.push(this.playEndlessModeItem);
                this.instructionsItem = this.createOutlinedText('How to play', 18, 310, 2);
                this.instructionsItem.alpha = 0;
                this.menuItems.push(this.instructionsItem);
                this.creditsItem = this.createOutlinedText('Credits', 18, 350, 2);
                this.creditsItem.alpha = 0;
                this.menuItems.push(this.creditsItem);
                this.finishedEntrance = false;
                this.mainView.addChild(this.title, this.playCampaignItem, this.playEndlessModeItem, this.instructionsItem, this.creditsItem);


                this.setupMouseInteraction();
                

                //entrance
                var that = this;
                setTimeout(function() {
                    createjs.Tween.get(that.title).to({ y: 120 }, 1000, createjs.Ease.backInOut).call(function () {
                        for (var i = 0; i < that.menuItems.length; i++) {
                            createjs.Tween.get(that.menuItems[i]).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                            setTimeout(function () {
                                that.finishedEntrance = true;
                            }, 500);
                        }
                    });
                }, 1000);
            },
            activate:function() {
                assetManager.playMusic('bossa',0.2);
            },
            setupMouseInteraction:function() {
                var that = this;
                
                this.playCampaignItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.playCampaignItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 0;
                });
                this.playCampaignItem.addEventListener("click", function (evt) {
                    that.goToGameScreen.fire();
                });
                this.instructionsItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.instructionsItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 2;
                });
                this.instructionsItem.addEventListener("click", function (evt) {
                    that.goToInstructionsScreen.fire();
                });
                this.creditsItem.addEventListener("mouseover", function (evt) {
                    for (var j = 0; j < that.menuItems.length; j++) {
                        if (j == 1)
                            continue;
                        that.menuItems[j].main.color = that.menuItems[j] === that.creditsItem ? that.highlightedColor : that.unHighlightedColor;
                    }
                    that.currentHighlightedItem = 3;
                });
                this.creditsItem.addEventListener("click", function (evt) {
                    that.goToCreditsScreen.fire();
                });
            },
            handleKeyDown: function (e) {
                if (!this.finishedEntrance)
                    return;
                if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                    this.moveOneItemDown();
                } else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                    this.moveOneItemUp();
                }
                if (e.keyCode == constants.KEY_SPACE || e.keyCode == constants.KEY_ENTER) {
                    if (this.currentHighlightedItem == 0)
                        this.goToGameScreen.fire();
                    else if (this.currentHighlightedItem == 2)
                        this.goToInstructionsScreen.fire();
                    else if (this.currentHighlightedItem == 3)
                        this.goToCreditsScreen.fire();
                }
            },
            handleKeyUp: function (e) {

            },
            moveOneItemDown: function () {
                this.menuItems[this.currentHighlightedItem].main.color = this.unHighlightedColor;
                if (this.currentHighlightedItem == 0) //skip coming soon
                    this.currentHighlightedItem = 2; 
                else if (this.currentHighlightedItem == this.menuItems.length -1)
                    this.currentHighlightedItem = 0;
                else
                    this.currentHighlightedItem++;
                this.menuItems[this.currentHighlightedItem].main.color = this.highlightedColor;
            },
            moveOneItemUp:function() {
                this.menuItems[this.currentHighlightedItem].main.color = this.unHighlightedColor;
                if (this.currentHighlightedItem == 0) 
                    this.currentHighlightedItem = this.menuItems.length - 1;
                else if (this.currentHighlightedItem == 2)//skip coming soon
                    this.currentHighlightedItem = 0;
                else
                    this.currentHighlightedItem--;
                this.menuItems[this.currentHighlightedItem].main.color = this.highlightedColor;
            }
        });
    });