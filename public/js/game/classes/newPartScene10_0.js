class newPartScene10_0 extends Phaser.Scene {

    constructor () {
        super({
            key: 'newPartScene10_0',
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
        console.log(newMap);
        this.load.tilemapTiledJSON(''+newMap.coords+'', path + 'assets/json/'+newMap.coords+'.json');
    }

    create () {
        var self = this;

        function addPlayer (self, playerInfo) {
            if(playerInfo.room === newMap.coords) {
                var x, y;
                if (newMap.direction === "left") {
                    x = map.widthInPixels - 128;
                    y = newMap.y;
                }
                if (newMap.direction === "right") {
                    x = 128;
                    y = newMap.y;
                }
                if (newMap.direction === "up") {
                    x = newMap.x;
                    y = map.heightInPixels - 128;
                }
                if (newMap.direction === "down") {
                    x = newMap.x;
                    y = 128;
                }
                console.log(self.player);
                if(!self.player) {
                    self.player = self.physics.add.sprite(x, y, "hunter").setScale(.5);
                    self.physics.add.collider(self.player, obstacleLayer);
                    self.cameras.main.startFollow(self.player);
                }
            }
        }


        function addOtherPlayers (self, playerInfo, room = false) {
            if(!room) {
                room = '0-0';
            }

            if(room === newMap.coords) {
                const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "hunter").setScale(.5);
                otherPlayer.playerId = playerInfo.playerId;
                self.otherPlayers.add(otherPlayer);
            }
        }
        map = this.make.tilemap({ key: newMap.coords });
        var scene = this.scene;

        // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // of the tileset image used when loading the file in preload.
        var tiles = map.addTilesetImage('world', 'tiles');
        // You can load a layer from the map using the layer name from Tiled, or by using the layer
        // index (0 in this case).
        var worldLayer = map.createStaticLayer("worldLayer", tiles, 0, 0);
        var obstacleLayer = map.createStaticLayer("obstacleLayer", tiles, 0, 0);
        obstacleLayer.setCollisionByProperty({block : true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.socket = connection;
        this.otherPlayers = this.physics.add.group();
        this.socket.emit('playerMovedMap', {key: newMap.coords});
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function(id) {
                if(players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id], newMap);
                } else {
                    addOtherPlayers(self, players[id], newMap.coords);
                }
            });
        });
        this.socket.on('playerChangedPosition', function (player) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (player.playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
            if(player.room === newMap.coords) {
                addOtherPlayers(self, player, player.room);
            }
        });
        this.socket.on('newPlayer', function (playerInfo) {
            addOtherPlayers(self, playerInfo);
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
                    if(playerInfo.direction) {
                        otherPlayer.anims.play("hunter_run_" + playerInfo.direction, true);
                    } else {
                        otherPlayer.anims.play("hunter_stand_front");
                    }
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });
    }

    update (time, delta) {

        var speed = 250;

        if(this.player) {


            var x = this.player.x;
            var y = this.player.y;
            let newMapKey;

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


                console.log('Beam');
                console.log(newMapKey);

                this.scene.pause();
                this.socket.emit('playerMovedMap', {key: newMapKey});
                this.scene.start('newPartScene', { player: this.player, coords: newMapKey, x: this.player.x, y: this.player.y, direction: this.player.movement.direction, connection: this.socket });
            }

            // emit player movement
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
                this.socket.emit('playerMovement', {
                    x: this.player.x,
                    y: this.player.y,
                    direction: this.player.movement.direction,
                    room: newMapKey
                });
            }
            // save old position data
            this.player.oldPosition = {
                x: this.player.x,
                y: this.player.y
            };
        }

    }
}