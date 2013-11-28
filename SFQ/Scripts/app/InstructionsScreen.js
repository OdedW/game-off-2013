define('InstructionsScreen',
    ['MenuScreen', 'createjs'], function (MenuScreen, createjs) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                this.goal = this.createOutlinedText('Have the cashier scan all of your items to check out!', 18, 130, 2);
                this.subItem1 = this.createOutlinedText("• Stand in line (or don't)", 18, 200, 2);
                this.subItem2 = this.createOutlinedText("• Be nice to others (or don't)", 18, 230, 2);
                this.subItem3 = this.createOutlinedText("• Be a hero", 18, 260, 2);
                this.subItem4 = this.createOutlinedText("• Arrow/WASD keys to move", 18, 290, 2);
                this.subItem5 = this.createOutlinedText("• Space/Enter to skip dialog", 18, 320, 2);
                this.subItem6 = this.createOutlinedText("• P to pause, M to mute", 18, 350, 2);
                this.subItem7 = this.createOutlinedText("• Mouse over cashiers to see their stats", 18, 380, 2);
                this.mainView.addChild(this.goal, this.subItem1, this.subItem2, this.subItem3, this.subItem4, this.subItem5,
                    this.subItem6, this.subItem7, this.subItem8);

                this.mainView.addEventListener("click", function (evt) {
                        that.goToMainMenuScreen.fire();
                });
            },
            handleKeyDown: function (e) {
                this.goToMainMenuScreen.fire();
            },
        });
    });