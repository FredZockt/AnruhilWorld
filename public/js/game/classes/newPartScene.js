class newPartScene extends Phaser.Scene {

    constructor () {
        super({
            key: 'newPartScene',
        });
    }

    init (data) {
        newMap = data;
        connection = data.connection;
        player = data.player;
    }

    preload () {
        var progress = this.add.graphics();
        this.load.on('progress', function (value) {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, 270, gameWidth * value, 60);

        });
        this.load.on('complete', function () {
            progress.destroy();

        });

        // first layer of world json
        this.load.tilemapTiledJSON(''+newMap.coords+'', path + 'assets/json/'+newMap.coords+'.json');
        this.load.tilemapTiledJSON('10-0', path + 'assets/json/10-0.json');

    }

    create () {
        var self = this;

        map = this.make.tilemap({ key: newMap.coords });
        var scene = this.scene;

        // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // of the tileset image used when loading the file in preload.
        var tiles = map.addTilesetImage('world', 'tiles');
        // You can load a layer from the map using the layer name from Tiled, or by using the layer
        // index (0 in this case).
        worldLayer = map.createDynamicLayer("worldLayer", tiles, 0, 0);
        obstacleLayer = map.createDynamicLayer("obstacleLayer", tiles, 0, 0);
        obstacleLayer.setCollisionByProperty({block : true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.socket = connection;
        this.otherPlayers = this.physics.add.group();
        this.socket.emit('playerMovedMap', {key: newMap.coords, recall: false});
        this.socket.on('currentPlayers', function(players, recall) {

            if(players[self.socket.id]) {
                if(recall === false) {
                    self.addPlayer(self, players[self.socket.id], '0-0', obstacleLayer);
                }
            }

            Object.keys(players).forEach(function(id) {
                if(players[id].playerId !== self.socket.id) {
                    self.addOtherPlayers(self, players[id]);
                }
            });
        });
        this.socket.on('playerChangedPosition', function (player) {
            if(self.otherPlayers.getChildren().length === 0 && player.room === self.player.room) {
                self.addOtherPlayers(self, player);
            } else {
                self.otherPlayers.getChildren().forEach(function (otherPlayer) {

                    if (player.playerId === otherPlayer.playerId) {
                        console.log('changed');

                        otherPlayer.room = player.room;
                        if(otherPlayer.room !== self.player.room) {
                            otherPlayer.destroy();
                        }
                    } else if(player.playerId === self.player.playerId) {
                        console.log('thats me');
                    } else {
                        if(player.room === self.player.room) {
                            self.addOtherPlayers(self, player);
                        }
                    }


                });
            }
        });
        this.socket.on('newPlayer', function (playerInfo) {
            self.addOtherPlayers(self, playerInfo);
        });
        this.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    if(playerInfo.room === self.player.room) {
                        if (playerInfo.direction) {
                            otherPlayer.anims.play("hunter_run_" + playerInfo.direction, true);
                        } else {
                            otherPlayer.anims.play("hunter_stand_front");
                        }
                        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    } else {
                        otherPlayer.destroy();
                    }
                }
            });
        });
    }

    update (time, delta) {

        var speed = 50;

        if(this.player) {


            var x = this.player.x;
            var y = this.player.y;

            // Stop any previous movement from the last frame
            if(this.player.body) {
                this.player.body.setVelocity(0);
            }


            // check for faster walking
            var tile = map.getTileAt(map.worldToTileX(x), map.worldToTileY(y), true, 0);
            if (tile.properties.way) {
                speed += 50;
            }

            this.player.movement = {
                direction: ""
            };

            // Movement
            if (controls.left.isDown) {
                this.player.body.setVelocityX(-speed);
                this.player.anims.play("hunter_run_left", true);
                this.player.movement.direction = "left";
            } else if (controls.right.isDown) {
                this.player.body.setVelocityX(speed);
                this.player.anims.play("hunter_run_right", true);
                this.player.movement.direction = "right";
            } else if (controls.up.isDown) {
                this.player.body.setVelocityY(-speed);
                this.player.anims.play("hunter_run_up", true);
                this.player.movement.direction = "up";
            } else if (controls.down.isDown) {
                this.player.body.setVelocityY(speed);
                this.player.anims.play("hunter_run_down", true);
                this.player.movement.direction = "down";
            } else {
                this.player.anims.play("hunter_stand_front");
            }

            if (tile.properties.loadNewPart) {
                if (this.player.movement.direction === 'up') {
                    newMapKey = map.properties.top;
                } else if (this.player.movement.direction === 'down') {
                    newMapKey = map.properties.bottom;
                } else if (this.player.movement.direction === 'left') {
                    newMapKey = map.properties.left;
                } else {
                    newMapKey = map.properties.right;
                }

                this.scene.pause();
                var check = this.createNewMap(newMapKey, this);
                if(check) {
                    this.scene.resume();
                }
            }

            // emit player movement
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
                this.socket.emit('playerMovement', {
                    x: this.player.x,
                    y: this.player.y,
                    direction: this.player.movement.direction,
                    room: this.player.room
                });

            }
            // save old position data
            this.player.oldPosition = {
                x: this.player.x,
                y: this.player.y
            };
        }

    }

    createNewMap (key, self) {
        this.physics.world.colliders.destroy();
        var newMapObject = this.make.tilemap( { key : key } );
        var tiles = map.addTilesetImage('world', 'tiles');
        worldLayer = newMapObject.createDynamicLayer("worldLayer", tiles, 0, 0);
        obstacleLayer = newMapObject.createDynamicLayer("obstacleLayer", tiles, 0, 0);

        map = newMapObject;

        obstacleLayer.setCollisionByProperty({block : true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.socket.emit('playerMovedMap', {key: key, recall: true});
        this.addPlayer(self, self.player, key, obstacleLayer);
        return true;
    }

    addPlayer (self, playerInfo, newMap, obstacleLayer, recall) {
        //if(playerInfo.room === newMap.coords) {
            if(!self.player) {
                self.player = self.physics.add.sprite(64, 64, "hunter").setScale(.5);
                self.physics.add.collider(self.player, obstacleLayer);
                self.cameras.main.startFollow(self.player);
                self.player.room = newMap;
                self.player.setDepth(1);
            } else {

                var x = '';
                var y = '';
                if (playerInfo.movement.direction === "left") {
                    x = map.widthInPixels - 64;
                    y = playerInfo.y;
                }
                if (playerInfo.movement.direction === "right") {
                    x = 64;
                    y = playerInfo.y;
                }
                if (playerInfo.movement.direction === "up") {
                    x = playerInfo.x;
                    y = map.heightInPixels - 64;
                }
                if (playerInfo.movement.direction === "down") {
                    x = playerInfo.x;
                    y = 64;
                }


                self.physics.add.collider(self.player, obstacleLayer);
                self.player.setPosition(x,y);
                self.player.room = newMap;
            }
        //}
    }

    addOtherPlayers (self, playerInfo) {
        if(self.player && playerInfo.room === self.player.room) {
            const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "hunter").setScale(.5);
            otherPlayer.playerId = playerInfo.playerId;
            self.otherPlayers.add(otherPlayer);
        }
    }
}