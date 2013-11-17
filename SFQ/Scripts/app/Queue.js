define('Queue',
    ['createjs', 'NpcEntity', 'constants', 'utils', 'assetManager', 'CashierEntity', 'tileManager','text'],
    function (createjs, NpcEntity, constants, utils, assetManager, CashierEntity, tileManager,text) {
        return Class.extend({
            init: function (row, col, maxCreatures, minCreatures, entryRow, exitRow) {
                this.row = row;
                this.col = col;
                this.entryRow = entryRow;
                this.exitRow = exitRow;
                this.maxCreatures = maxCreatures;
                this.minCreatures = minCreatures;
                this.npcsInQueue = [];
                this.allNpcs = [];
                this.timeSinceLastScan = 0;
                this.timeSinceLastNpcAddCheck = 0;
                this.mistakeDialogStarted = false;
                //create cashier and table
                this.cashier = new CashierEntity(row - 1, col + this.maxCreatures + 1);
                tileManager.collisionMap[this.cashier.currentRow][this.cashier.currentColumn] = true;
                this.table = new createjs.Bitmap(assetManager.images.table);
                this.tablePosition = { row: row, col: col + this.maxCreatures + 1 };
                var pos = utils.getAbsolutePositionByGridPosition(this.tablePosition.row, this.tablePosition.col);
                this.table.x = pos.x;
                this.table.y = pos.y + 6;
                this.table.scaleX = 1.2;
                this.cashRegister = new createjs.Bitmap(assetManager.images.cashRegister);
                this.cashRegister.x = pos.x + 2;
                this.cashRegister.y = pos.y ;
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
                views.push(this.cashRegister);
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
                if (this.npcsInQueue.length > 0 && this.npcsInQueue[0].firstInLine && !this.mistakeDialogStarted) {
                    this.timeSinceLastScan += evt.delta;
                    if (this.timeSinceLastScan >= constants.BASE_SCANE_TIME) {
                        this.timeSinceLastScan = 0;
                        this.scan();
                    }
                }

                //check if need to add new npc
                if (this.npcsInQueue.length < constants.MAX_CREATURES_IN_QUEUE) {
                    this.timeSinceLastNpcAddCheck += evt.delta;
                    if (this.timeSinceLastNpcAddCheck > constants.TIME_TO_MAYBE_ADD_NPC_TO_QUEUE) {
                        this.timeSinceLastNpcAddCheck = 0;
                        if (Math.random() > constants.CHANCE_OF_NEW_NPC) {
                            this.addNewNpc();
                        }
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
                    this.currentItem.x = pos.x + 27;
                    this.currentItem.y = pos.y + 9;
                    this.viewAdded.fire(this.currentItem);
                    //assetManager.playSound('beep', 0.1);
                } else {
                    //chance for mistake
                    if (!this.npcsInQueue[0].mistakeWasMade && Math.random() * 10 > this.cashier.accuracy) {
                        this.startMistakeDialog();
                    }
                    else {
                        this.npcsInQueue[0].hideItemCount();
                        this.leave();
                    }
                }
            },
            startMistakeDialog: function(){
                this.mistakeDialogStarted = true;
                var that = this;
                this.npcsInQueue[0].mistakeWasMade = true;
                this.npcsInQueue[0].say(text.getRandomText(text.mistakeTexts), function () {
                    that.cashier.say("Sorry, I'll have to do it again", function () {
                        that.npcsInQueue[0].itemCount = that.npcsInQueue[0].initialItemCount;
                        that.mistakeDialogStarted = false;
                    }, 2000);
                }, 2000);
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
                npc.movementDestination = { row: this.tablePosition.row, col: this.tablePosition.col - 1 };
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
                var destRow = this.exitRow;
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
                                
            },
            addNewNpc: function () {
                if (tileManager.collisionMap[this.entryRow][0]) //someone is already occupying that square
                    return;
                var creature = new NpcEntity(this.entryRow, 0);
                this.npcsInQueue.push(creature);
                this.allNpcs.push(creature);
                this.setNpcToAdvanceInQueue(creature);
                this.viewAdded.fire(creature.view);
            }
        });
    });