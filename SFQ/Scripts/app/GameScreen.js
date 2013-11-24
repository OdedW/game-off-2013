﻿define('GameScreen',
    ['createjs', 'Screen', 'PlayerEntity', 'Queue', 'assetManager', 'constants', 'tileManager', 'CopEntity' , 'utils', 'RobberEntity', 'text'],
    function (createjs, Screen, PlayerEntity, Queue, assetManager, constants, tileManager, CopEntity, utils, RobberEntity, text) {
        return Screen.extend({

            init: function (level, retries) {
                var that = this;
                this.currentLevel = level || 0;
                this.retries = retries || 0;
                this._super();
                this.gameWorld = new createjs.Container();
                this.mainView.addChild(this.gameWorld);

                //win text
                this.endStateText = new createjs.Text('Checked out!', "36px Minecraftia", "white");
                this.endStateText.alpha = 0;               
                this.endStateText.textAlign = 'center';
                this.endStateText.textBaseline = 'middle';
                this.pressAnyKeyText = new createjs.Text('press any key', "16px Minecraftia", "white");
                this.pressAnyKeyText.alpha = 0;
                this.pressAnyKeyText.textAlign = 'center';
                this.pressAnyKeyText.textBaseline = 'middle';
                this.mainView.addChild(this.endStateText, this.pressAnyKeyText);
              
                //gameWorld
                var bg = new createjs.Bitmap(assetManager.images.bg);
                this.gameWorld.addChild(bg);
                this.setupLevel();
                this.cops = [];
                this.gameWorld.addChild(this.player.view);
                
                //win/lose states
                this.inWinState = false;
                this.inLoseState = false;
                this.player.winState.add(function () {
                    that.inWinState = true;
                    that.showEndState.apply(that, ['Checked out!']);
                });
                this.player.loseState.add(function (text) {
                    that.inLoseState = true;
                    that.showEndState.apply(that, [text]);
                });
                
                //hitpoints
                var x = 10;
                this.hitPointsIcons = [];
                for (var i = 0; i < this.player.hitPoints; i++) {
                    var heart = new createjs.Bitmap(assetManager.images.heart);
                    heart.x = x;
                    heart.y = 6;
                    this.hitPointsIcons.push(heart);
                    this.gameWorld.addChild(heart);
                    x += 36;
                }
                this.player.tookHit.add(function() {
                    that.gameWorld.removeChild(that.hitPointsIcons[that.hitPointsIcons.length - 1]);
                    that.hitPointsIcons.splice(that.hitPointsIcons.length - 1, 1);
                });

                //timer
                this.timeSinceLevelStart = 0;
                this.timeLabel = new createjs.Text('00:00', "25px " + constants.FONT, "#0BF50B");
                this.timeLabel.x = constants.WORLD_WIDTH - 90;
                this.timeLabel.y = -2;
                this.gameWorld.addChild(this.timeLabel);

                //item count
                this.bag = new createjs.Bitmap(assetManager.images.bag);
                this.bag.x = 185;
                this.bag.y = 4;
                
                this.itemCountLabel = new createjs.Text(this.player.itemCount, "25px " + constants.FONT, "white");
                this.itemCountLabel.x = 140;
                this.itemCountLabel.y = 0;
                this.gameWorld.addChild(this.bag, this.itemCountLabel);

                //endgame
                this.setupEndgame();
                this.isInEndgameCutscene = false;
            },
            setupLevel: function () {
                var that = this;
                this.spawnedCops = false;
                var currentLevel = window.levels[this.currentLevel];
                this.player = new PlayerEntity(currentLevel.entryRow, 0);
                this.currentLevelTimes = currentLevel.times;
                this.player.itemCount = currentLevel.itemCount;
                this.queues = [];
                for (var i = 0; i < currentLevel.queues.length; i++) {
                    this.createQueue(currentLevel.queues[i]);
                }

                if (this.currentLevel == 0){//window.levels.length - 1){ //last level, trigger end game
                    this.player.moved.add(function triggerEndGame() {
                        if (that.player.col == 3) {
                            that.player.moved.remove(triggerEndGame);
                            that.activateEndGame();
                        }
                    });
                }
            }, createQueue: function (args) {
                var queue = new Queue(this.player, args[0], args[1], args[2], args[3], args[4], args[5]);
                var views = queue.getViews();
                for (var i = 0; i < views.length; i++) {
                    this.gameWorld.addChild(views[i]);
                }
                var that = this;
                queue.viewAdded.add(function (view) {
                    that.gameWorld.removeChild(that.player.view); //player is always on top
                    that.gameWorld.addChild(view);
                    that.gameWorld.addChild(that.player.view);

                });
                queue.viewRemoved.add(function (view) {
                    that.gameWorld.removeChild(view);
                });

                queue.npcDied.add(function () {                    
                    var cop1 = new CopEntity(args[5], constants.NUM_COLUMNS - 1, that.player, this.spawnedCops);
                    var cop2 = new CopEntity(args[4], 0, that.player, !this.spawnedCops);
                    that.cops.push(cop1);
                    that.cops.push(cop2);
                    that.gameWorld.addChild(cop1.view, cop2.view);
                    this.spawnedCops = true;
                });
                this.queues.push(queue);
            },
            showEndState:function(text) {
                this.endStateText.text = text;
                this.endStateText.x = constants.WORLD_WIDTH / 2;
                this.endStateText.y = constants.WORLD_HEIGHT / 2 - 15;
                this.pressAnyKeyText.x = constants.WORLD_WIDTH / 2;
                this.pressAnyKeyText.y = constants.WORLD_HEIGHT / 2 + 25;
                createjs.Tween.get(this.gameWorld).to({ alpha: 0.2 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.endStateText).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
                createjs.Tween.get(this.pressAnyKeyText).to({ alpha: 1 }, 200, createjs.Ease.quadIn);
            },
            handleKeyDown: function (e) {
                if (e.keyCode == constants.KEY_SPACE) {
                    this.activateEndGame();
                }
                    
                if (this.inWinState || this.inLoseState) {
                    this.currentLevel += this.inWinState ? 1 : 0;
                    this.needsReset.fire();
                }

                if (this.isInEndgameCutscene)
                    return;
                
                //movement
                if (e.keyCode === constants.KEY_S || e.keyCode === constants.KEY_DOWN) {
                    this.player.move(0, 1);
                } else if (e.keyCode === constants.KEY_A || e.keyCode === constants.KEY_LEFT) {
                    this.player.move(-1, 0);
                } else if (e.keyCode === constants.KEY_W || e.keyCode === constants.KEY_UP) {
                    this.player.move(0, -1);
                } else if (e.keyCode === constants.KEY_D || e.keyCode === constants.KEY_RIGHT) {
                    this.player.move(1, 0);
                }
            },
            handleKeyUp: function(e) {

            },
            activate: function() {

            },
           
            tick: function (evt) {
                if (this.inWinState || this.inLoseState) {
                    return;
                }
                
                for (var i = 0; i < this.queues.length; i++) {
                    this.queues[i].tick(evt);
                }
                for (var j = 0; j < this.cops.length; j++) {
                    this.cops[j].tick(evt);
                }

                if (this.robber)
                    this.robber.tick(evt);

                //time
                this.timeSinceLevelStart += evt.delta;
                this.timeLabel.text = utils.msToReadableTime(this.timeSinceLevelStart);
                if (this.timeSinceLevelStart > this.currentLevelTimes[1] * 1000)
                    this.timeLabel.color = "red";
                else if (this.timeSinceLevelStart > this.currentLevelTimes[0] * 1000)
                    this.timeLabel.color = "orange";
                
                //item count
                this.itemCountLabel.text = this.player.itemCount;
            },
            reset: function () {
                var that = this;
                that.mainView.removeAllChildren();
                tileManager.clearCollisionMap();
                that.init(that.currentLevel,that.retries + 1);
            },
            setupEndgame:function() {
                this.movieBlocks = new createjs.Shape();
                this.movieBlocks.alpha = 0;
                this.movieBlocks.graphics.beginFill("black").drawRect(0, 0, constants.WORLD_WIDTH, constants.TILE_SIZE)
                    .drawRect(0, constants.WORLD_HEIGHT - constants.TILE_SIZE, constants.WORLD_WIDTH, constants.TILE_SIZE);
                this.gameWorld.addChild(this.movieBlocks);
            },
            activateEndGame: function () {
                var that = this;
                that.isInEndgameCutscene = true;
                createjs.Tween.get(this.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                for (var j = 0; j < that.queues.length; j++) {
                    that.queues[j].pauseNpcs = true;
                    that.queues[j].isInEndgame = true;
                }
                setTimeout(function () {

                    //enter robber
                    that.robber = new RobberEntity();
                    that.gameWorld.addChild(that.robber.view);
                    that.robber.movementDestination = { row: 5, col: 13 };
                    that.robber.shouldMove = true;
                    that.robber.finishedMoving.add(function sayStickup() {
                        that.robber.say(text.getRobberText(text.robber.enterTexts, that.retries));
                        that.robber.finishedMoving.remove(sayStickup);
                        setTimeout(function() {
                            that.robber.movementDestination = { row: 5, col: 9 };
                            that.robber.shouldMove = true;
                            that.robber.finishedMoving.add(function continueConversation() {
                                that.robber.finishedMoving.remove(continueConversation);
                                that.continueEndGameWithRobber.apply(that);
                            });

                        },7000);
                        setTimeout(function() {
                            //move everyone to the back
                            var count = 0;
                            for (var j = 0; j < that.queues.length; j++) {
                                that.queues[j].pauseNpcs = false;
                                for (var i = 0; i < that.queues[j].allNpcs.length; i++) {
                                    var npc = that.queues[j].allNpcs[i];
                                    that.moveNpcOffScreen(npc, count, that);
                                    count++;
                                }
                            }

                            //move cops out
                            for (var j = 0; j < that.cops.length; j++) {
                                var cop = that.cops[j];
                                that.moveNpcOffScreen(cop, count, that);
                                count++;
                            }

                            that.endgameNpcsOnScreenCount = count;

                            //move cashiers to the corners
                            for (var j = 0; j < that.queues.length; j++) {
                                var cashier = that.queues[j].cashier;
                                cashier.avatar.gotoAndPlay('scared');
                                cashier.movementDestination = constants.CORNERS[j];
                                cashier.shouldMove = true;
                            }
                        }, 4000);
                    });
                    
                    //hide UI elements
                    that.timeLabel.alpha = 0;
                    that.bag.alpha = 0;
                    that.itemCountLabel.alpha = 0;
                }, 3000);

            },
            moveNpcOffScreen:function(npc, count, that) {
                npc.avatar.gotoAndPlay('scared');
                npc.ignorePlayerWhenMoving = true;
                npc.movementSpeed = (2 * npc.movementSpeed) / 3; //speed things up
                npc.movementDestination = { row: constants.ENTRY_ROWS[count % constants.ENTRY_ROWS.length], col: -1 };
                npc.finishedMoving.add(function (n) {
                    that.gameWorld.removeChild(n.view);
                    tileManager.collisionMap[n.row][n.col] = false;
                    that.endgameNpcsOnScreenCount--;
                });
                npc.shouldMove = true;
            },
            continueEndGameWithRobber: function () {
                var that = this;
                this.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.retries)[0]);
                setTimeout(function() {
                    that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.retries)[1], 1500);
                }, 4000);

                setTimeout(function () {
                    that.robber.say(text.getRobberText(text.robber.afterEveryoneLeaves, that.retries)[2]);
                }, 6000);

                setTimeout(function() {
                    createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn).call(function() {
                        that.isInEndgameCutscene = false;
                        var count = 0;
                        that.player.moved.add(function tookStep() {
                            count++;
                            if (count < 4) {
                                that.isInEndgameCutscene = true;
                                var msg = '';
                                if (count === 1)
                                    msg = text.getRobberText(text.robber.provoked, that.retries)[0];
                                else if (count === 2)
                                    msg = text.getRobberText(text.robber.provoked, that.retries)[1];
                                else {
                                    msg = text.getRobberText(text.robber.provoked, that.retries)[2];
                                }
                                createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                                that.robber.say(msg, 3000, function () {
                                    createjs.Tween.get(that.movieBlocks).to({ alpha: 0 }, 500, createjs.Ease.quadIn);
                                    that.isInEndgameCutscene = false;
                                    if (count == 3) {
                                        that.player.moved.remove(tookStep);
                                        that.startBossFight.apply(that);
                                    }
                                });
                            }
                        });
                    });
                },10000);
            },
            startBossFight: function () {
                var that = this;
                
                this.robber.kill(this.player);
                this.robber.died.add(function() {
                    createjs.Tween.get(that.movieBlocks).to({ alpha: 1 }, 500, createjs.Ease.quadIn);
                    this.isInEndgameCutscene = true;

                });
            }
        });
    });