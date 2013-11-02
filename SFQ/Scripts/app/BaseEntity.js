define('BaseEntity',
    ['createjs'], function () {
        return Class.extend({
            init: function () {
                this.setSize();
            },
            setSize:function(){
                this.size = { w: 0, h: 0 };
            },
            getBounds:function(){
                return { x: this.view.x, y: this.view.y, width: this.size.w, height: this.size.h };
            }
        })
    });