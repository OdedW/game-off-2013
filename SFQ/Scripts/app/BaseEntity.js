define('BaseEntity',
    ['createjs'], function (createjs) {
        return Class.extend({
            init: function (x, y) {
                this.setSize();
                this.createSpriteSheet();
                this.createView(x, y);
            },
            createSpriteSheet:function(){

            },
            createView:function(){

            },
            setSize:function(){
                this.size = { w: 0, h: 0 };
            },
            getBounds:function(){
                return { x: this.view.x, y: this.view.y, width: this.size.w, height: this.size.h };
            }
        })
    });