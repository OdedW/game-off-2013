define('Queue',
    ['createjs', 'NpcEntity', 'constants', 'utils', 'assetManager', 'CashierEntity', 'tileManager'],
    function (createjs, NpcEntity, constants, utils, assetManager, CashierEntity, tileManager) {
        return Class.extend({
            init: function (row, col, maxCreatures, minCreatures) {
                this.row = row;
                this.col = col;
                this.maxCreatures = maxCreatures;
                this.minCreatures = minCreatures;
                this.npcsInQueue = [];
                this.allNpcs = [];
                this.timeSinceLastScan = 0;

                //create cashier and table
                this.cashier = new CashierEntity(row - 1, col + this.maxCreatures + 1);
                tileManager.collisionMap[this.cashier.currentRow][this.cashier.currentColumn] = true;
                this.table = new createjs.Bitmap(assetManager.images.table);
                this.tablePosition = { row: row, col: col + this.maxCreatures + 1 };
                var pos = utils.getAbsolutePositionByGridPosition(this.tablePosition.row, this.tablePosition.col);
                this.table.x = pos.x + 4;
                this.table.y = pos.y + 6;
                this.currentItem = null;

                //create npcs in queue
                this.numOfCreatures = Math.round(Math.random() * (maxCreatures - minCreatures) + minCreatures);
                for (var i = 0; i < this.numOfCreatures; i++) {
                    var creature = new NpcEntity(row, col + this.maxCreatures - i);
                    this.npcsInQueue.push(creature);
                    this.allNpcs.push(creature);
                    this.setNpcToAdvanceInQueue(creature);
                }
                this.npcsInQueue[0].firstInLine = true;

                //callbacks
                this.viewAdded = $.Callbacks();
                this.viewRemoved = $.Callbacks();
            },
            getViews: function () {
                var views = [];
                views.push(this.cashier.view);
                views.push(this.table);
                if (this.currentItem) {
                    views.push(this.currentItem);
                }
                for (var i = 0; i < this.allNpcs.length; i++) {
                    views.push(this.allNpcs[i].view);
                }

                return views;

            },
            tick: function (evt) {
                for (var i = 0; i < this.allNpcs.length; i++) {
                    this.allNpcs[i].tick(evt);
                }
                if (this.npcsInQueue.length > 0 && this.npcsInQueue[0].firstInLine) {
                    this.timeSinceLastScan += evt.delta;
                    if (this.timeSinceLastScan >= constants.BASE_SCANE_TIME) {
                        this.timeSinceLastScan = 0;
                        this.scan();
                    }
                }


            },
            scan: function () {
                if (this.currentItem) {
                    this.viewRemoved.fire(this.currentItem);
                }
                if (this.npcsInQueue[0].itemCount > 0) {
                    this.npcsInQueue[0].removeItem();
                    this.currentItem = this.getRandomItem();
                    var pos = utils.getAbsolutePositionByGridPosition(this.row, this.col + this.maxCreatures + 1);
                    this.currentItem.x = pos.x + 16;
                    this.currentItem.y = pos.y + 9;
                    this.viewAdded.fire(this.currentItem);
                } else {
                    this.npcsInQueue[0].hideItemCount();
                    this.leave();
                }
            },
            getRandomItem: function () {
                var index = Math.random() * 129;
                var data = {
                    images: [assetManager.images.items],
                    frames: { width: 16, height: 16 },
                    animations: {
                        idle: { frames: [index], speed: 0 }
                    }
                };
                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, 'idle');
                return sprite;
            },
            setNpcToAdvanceInQueue: function (npc) {
                npc.movementDestination = { row: npc.currentRow, col: this.tablePosition.col - 1 };
                npc.finishedMoving.add(function setFirstInLine() {
                    npc.finishedMoving.remove(setFirstInLine);
                    npc.firstInLine = true;
                });
                npc.shouldMove = true;

            },
            leave: function () {
                //init the npc to leave
                var npcLeaving = this.npcsInQueue[0];
                npcLeaving.firstInLine = false;
                this.npcsInQueue.splice(0, 1);
                npcLeaving.shouldMove = true;

                //set the destination
                var destRow = npcLeaving.currentRow;
                if (destRow < Math.floor(constants.NUM_ROWS / 2))
                    destRow++;
                else if (destRow > Math.floor(constants.NUM_ROWS / 2))
                    destRow--;
                var destCol = constants.NUM_COLUMNS;
                npcLeaving.movementDestination = { row: destRow, col: destCol };

                //remove npc once it left
                var that = this;
                npcLeaving.finishedMoving.add(function () {
                    that.viewRemoved.fire(this.view);
                    tileManager.collisionMap[npcLeaving.currentRow][npcLeaving.currentColumn] = false;
                    that.allNpcs.splice(that.allNpcs.indexOf(npcLeaving), 1);
                    npcLeaving = null;

                });
            }
        });
    });