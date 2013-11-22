define('Queue',
    ['createjs', 'NpcEntity', 'constants', 'utils', 'assetManager', 'CashierEntity', 'tileManager','text'],
    function (createjs, NpcEntity, constants, utils, assetManager, CashierEntity, tileManager,text) {
        return Class.extend({
            init: function (player, row, col, maxCreatures, minCreatures, entryRow, exitRow) {
                var that = this;
                this.row = row;
                this.col = col;
                this.player = player;
                this.entryRow = entryRow;
                this.exitRow = exitRow;
                this.maxCreatures = maxCreatures;
                this.minCreatures = minCreatures;
                this.npcsInQueue = [];
                this.allNpcs = [];                
                this.mistakeDialogStarted = false;
                
                //times
                this.timeSinceLastScan = 0;
                this.timeSinceLastNpcAddCheck = 0;
                this.timeSinceLastCalledToMoveUp = -1;
                
                //create cashier and table
                this.cashier = new CashierEntity(row - 1, col + this.maxCreatures + 1);
                tileManager.collisionMap[this.cashier.currentRow][this.cashier.currentColumn] = this.cashier;
                this.table = new createjs.Bitmap(assetManager.images.table);
                this.tablePosition = { row: row, col: col + this.maxCreatures + 1 };
                this.firstInLinePosition = { row: row, col: col + this.maxCreatures };
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
                    this.createNewNpc(this.row, col + this.maxCreatures - i);

                }

                //callbacks
                this.viewAdded = $.Callbacks();
                this.viewRemoved = $.Callbacks();
                
                //handle player move
                this.player.moved.add(function() {
                    that.handlePlayerMove.apply(that); //fire in context
                });
            },
            createNewNpc: function (row, col) {
                var that = this;
                var npc = new NpcEntity(row, col);
                npc.placeInLine = this.npcsInQueue.length;
                this.npcsInQueue.push(npc);
                this.allNpcs.push(npc);
                this.setNpcToAdvanceInQueue(npc);
                npc.playerIsBlockingMove.add(function (sender) {
                    that.npcIsBlockedByPlayer.apply(that, [sender]);
                });
                return npc;
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
            tick: function(evt) {
                //advance timeSinceLastCalledToMoveUp
                if (this.timeSinceLastCalledToMoveUp != -1) {
                    this.timeSinceLastCalledToMoveUp += evt.delta;
                    if (this.timeSinceLastCalledToMoveUp > constants.TIME_BETWEEN_CALLS_TO_MOVE_UP)
                        this.timeSinceLastCalledToMoveUp = -1;
                }
                for (var i = 0; i < this.allNpcs.length; i++) {
                    this.allNpcs[i].tick(evt);
                }
                var creature = tileManager.collisionMap[this.firstInLinePosition.row][this.firstInLinePosition.col];
                if (creature) {
                    if (!this.mistakeDialogStarted) {
                        this.timeSinceLastScan += evt.delta;
                        if (this.timeSinceLastScan >= constants.BASE_SCANE_TIME) {
                            this.timeSinceLastScan = 0;
                            this.scan(creature);
                        }
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
            scan: function (creature) {
                if (this.currentItem) {
                    this.viewRemoved.fire(this.currentItem);
                }
                if (creature.itemCount > 0) {
                    creature.removeItem();
                    this.currentItem = this.getRandomItem();
                    var pos = utils.getAbsolutePositionByGridPosition(this.row, this.col + this.maxCreatures + 1);
                    this.currentItem.x = pos.x + 27;
                    this.currentItem.y = pos.y + 9;
                    this.viewAdded.fire(this.currentItem);
                    //assetManager.playSound('beep', 0.1);
                } else  if (this.npcsInQueue.indexOf(creature) >= 0) { //npc
                    //chance for mistake
                    if (!creature.mistakeWasMade && Math.random() * 10 > this.cashier.accuracy) {
                        this.startMistakeDialog(creature);
                    }
                    else {
                        creature.hideItemCount();
                        this.leave(creature);
                    }
                }
            },
            startMistakeDialog: function (creature) {
                this.mistakeDialogStarted = true;
                var that = this;
                creature.mistakeWasMade = true;
                creature.say(text.getRandomText(text.mistakeTexts), function () {
                    that.cashier.say("Sorry, I'll have to do it again", function () {
                       creature.itemCount = creature.initialItemCount;
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
                npc.shouldMove = true;

            },
            leave: function (creature) {
                //init the npc to leave
                creature.placeInLine = -1;
                this.moveUpInLine();
                this.npcsInQueue.splice(0, 1);
                creature.shouldMove = true;

                //set the destination
                var destRow = this.exitRow;
                var destCol = constants.NUM_COLUMNS;
                creature.movementDestination = { row: destRow, col: destCol };

                //remove npc once it left
                var that = this;
                creature.finishedMoving.add(function () {
                    that.viewRemoved.fire(this.view);
                    tileManager.collisionMap[creature.currentRow][creature.currentColumn] = false;
                    that.allNpcs.splice(that.allNpcs.indexOf(creature), 1);
                    creature = null;
                });
                                
            },
            moveUpInLine: function() {
                for (var i = 0; i < this.npcsInQueue.length; i++) {
                    this.npcsInQueue[i].placeInLine--;
                }  
            },
            addNewNpc: function () {
                if (tileManager.collisionMap[this.entryRow][0]) //someone is already occupying that square
                    return;
                var npc = this.createNewNpc(this.entryRow, 0);
                this.viewAdded.fire(npc.view);
            },           
            handlePlayerMove: function () {
                if (this.player.currentRow == this.row) {
                    if (this.npcsInQueue.length > 1 &&
                        this.npcsInQueue[this.npcsInQueue.length - 1].currentColumn < this.player.currentColumn) { //last
                        if (!this.playerInQueue) { //cut in line
                            var cutee = null;
                            for (var i = 0; i < this.npcsInQueue.length; i++) { //get the closest cutee
                                if (this.npcsInQueue[i].currentColumn < this.player.currentColumn) { //yell 
                                    if (!cutee)
                                        cutee = this.npcsInQueue[i];
                                    else {
                                        cutee = this.player.currentColumn - this.npcsInQueue[i].currentColumn <
                                            this.player.currentColumn - cutee.currentColumn ? this.npcsInQueue[i] : cutee;
                                    }
                                }
                            }
                            if (cutee) {
                                if (cutee.placeInLine == this.npcsInQueue.length - 1 && //last in line
                                    this.player.currentColumn - cutee.currentColumn > 1) //didn't reach end of the line yet, not quite cutting in line
                                    cutee.say(text.getRandomText(text.notQuiteCutInLineTexts));
                                else {
                                    cutee.say(text.getRandomText(text.cutInLineTexts));
                                    this.playerCutInLine = true;
                                }
                            }
                        }
                    }
                } else {
                    this.playerCutInLine = false;
                }
                this.playerInQueue = this.player.currentRow == this.row;
            },
            npcIsBlockedByPlayer:function(npc) {
                if (this.timeSinceLastCalledToMoveUp == -1 && //enough time passed
                    !this.playerCutInLine &&
                    this.player.currentColumn < this.tablePosition.col-1 && //not first in line
                    !tileManager.collisionMap[this.row][this.player.currentColumn + 1]) { //has place to advance
                    npc.say(text.getRandomText(text.playerHoldingUpLine));
                    this.timeSinceLastCalledToMoveUp = 0;
                }
            }
        });
    });