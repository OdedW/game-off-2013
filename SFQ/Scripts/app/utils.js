define('utils',
    ['createjs', 'constants'], function(createjs, constants) {
        var
            calculateIntersection = function (rect1, rect2, x, y) {
                // prevent x|y from being null||undefined
                x = x || 0; y = y || 0;

                // first we have to calculate the
                // center of each rectangle and half of
                // width and height
                var dx, dy, r1 = {}, r2 = {};
                r1.cx = rect1.x + x + (r1.hw = (rect1.width / 2));
                r1.cy = rect1.y + y + (r1.hh = (rect1.height / 2));
                r2.cx = rect2.x + (r2.hw = (rect2.width / 2));
                r2.cy = rect2.y + (r2.hh = (rect2.height / 2));

                dx = Math.abs(r1.cx - r2.cx) - (r1.hw + r2.hw);
                dy = Math.abs(r1.cy - r2.cy) - (r1.hh + r2.hh);

                if (dx < 0 && dy < 0) {
                    return { width: -dx, height: -dy };
                } else {
                    return null;
                }
            },
        calculateCollision = function (bounds, direction, collidables, moveBy, force) {
            moveBy = moveBy || {x:0,y:0};
            if ( direction != 'x' && direction != 'y' ) {
                direction = 'x';
            }
            var measure = direction == 'x' ? 'width' : 'height',
              oppositeDirection = direction == 'x' ? 'y' : 'x',
              oppositeMeasure = direction == 'x' ? 'height' : 'width',
              cbounds,
              collision = null,
              cc = 0;

            // for each collideable object we will calculate the
            // bounding-rectangle and then check for an intersection
            // of the hero's future position's bounding-rectangle
            if (direction == 'y' && moveBy.y > 0) {
                while (!collision && cc < collidables.length) {
                    cbounds = getBounds(collidables[cc]);
                    if (collidables[cc].isVisible) {
                        isCurrentlyColliding = calculateIntersection(bounds, cbounds, 0, 0);
                        if (!isCurrentlyColliding)
                            collision = calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
                    }

                    if (!collision && collidables[cc].isVisible) {
                        // if there was NO collision detected, but somehow
                        // the hero got onto the "other side" of an object (high velocity e.g.),
                        // then we will detect this here, and adjust the velocity according to
                        // it to prevent the Hero from "ghosting" through objects
                        // try messing with the 'this.velocity = {x:0,y:125};'
                        // -> it should still collide even with very high values
                        var wentThroughForwards = (bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction]),
                            wentThroughBackwards = (bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction]),
                            withinOppositeBounds = !(bounds[oppositeDirection] + bounds[oppositeMeasure] < cbounds[oppositeDirection])
                                && !(bounds[oppositeDirection] > cbounds[oppositeDirection] + cbounds[oppositeMeasure]);

                        if ((wentThroughForwards || wentThroughBackwards) && withinOppositeBounds) {
                            moveBy[direction] = cbounds[direction] - bounds[direction];
                        } else {
                            cc++;
                        }
                    }
                }
            }
            if ( collision && !force) {
                var sign = Math.abs(moveBy[direction]) / moveBy[direction];
                moveBy[direction] -= collision[measure] * sign;
            }
            
            //don't fall off the edge
            if (direction == 'x' && Math.abs(moveBy.x) > 0) {
                if (bounds.x + moveBy.x <= 0)
                    moveBy.x = -bounds.x;
                else if (bounds.x + bounds.width + moveBy.x >= constants.WORLD_WIDTH)
                    moveBy.x = constants.WORLD_WIDTH - (bounds.x + bounds.width);
            }
            return collision;
        },
          
            getBounds = function(obj) {
                var bounds = { x: obj.x, y: obj.y, width: obj.getBounds().width, height: obj.getBounds().height };
                return bounds;
            },
            getAbsolutePositionByGridPosition = function (row, col) {
                return {
                    x: col * constants.TILE_SIZE,
                    y: row * constants.TILE_SIZE
                };
            };
        return {
            getBounds: getBounds,
            calculateIntersection: calculateIntersection,
            calculateCollision: calculateCollision,
            getAbsolutePositionByGridPosition: getAbsolutePositionByGridPosition
        };
    });