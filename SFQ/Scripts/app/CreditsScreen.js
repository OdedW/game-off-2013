define('CreditsScreen',
    ['MenuScreen', 'assetManager', 'constants'], function (MenuScreen, assetManager, constants) {
        return MenuScreen.extend({
            init: function () {
                this._super();
                var that = this;
                
                this.title = this.createOutlinedText('All programming and music by Inja Games', 18, 50, 2);
                this.logo = new createjs.Bitmap(assetManager.images.logo);
                this.logo.y = 80;
                this.logo.x = 230;
                this.subItem1 = this.createOutlinedText("• Using the 16-bit set from Oryx Design Labs", 18, 310, 2);
                this.subItem2 = this.createOutlinedText("www.oryxdesignlab.com", 14, 332, 2);
                this.subItem3 = this.createOutlinedText("• Created with CreateJS", 18, 360, 2);
                this.subItem4 = this.createOutlinedText("• Cash register icon by www.fatcow.com", 18, 390, 2);
                this.subItem5 = this.createOutlinedText("• Thud sound by Speedenza from freesound", 18, 420, 2);
                this.subItem6 = this.createOutlinedText("Subscribe to our twitter feed for more news!", 18, 450, 2);
                this.subItem7 = this.createOutlinedText("twitter.com/InjaGames", 18, 480, 2);
                this.mainView.addChild(this.title, this.logo, this.subItem1, this.subItem2, this.subItem3, this.subItem4, this.subItem5, this.subItem6, this.subItem7);
                this.setupLink(this.subItem2, 'http://www.oryxdesignlab.com');
                this.setupLink(this.subItem7, 'http://twitter.com/InjaGames');
                this.mainView.addEventListener("click", function (evt) {
                    
                    if (!that.subItem2.hitTest(that.subItem2.globalToLocal(evt.stageX, evt.stageY).x,that.subItem2.globalToLocal(evt.stageX, evt.stageY).y ) && 
                        !that.subItem7.hitTest(that.subItem2.globalToLocal(evt.stageX, evt.stageY).x,that.subItem7.globalToLocal(evt.stageX, evt.stageY).y ))
                        that.goToMainMenuScreen.fire();
                });
            },
            activate:function() {
            },
            handleKeyDown: function (e) {
                this.goToMainMenuScreen.fire();
            },
            setupLink: function (element, url) {
                var elem = element;
                element.addEventListener("mouseover", function (evt) {
                    elem.main.color = 'lightblue';
                });
                element.addEventListener("mouseout", function (evt) {
                    elem.main.color = 'white';
                });
                element.addEventListener("click", function (evt) {
                    window.open(url, '_blank');
                });
            }
        });
    });