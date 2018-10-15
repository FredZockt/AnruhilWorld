class newPartScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'newPartScene'
        });
    }

    init(data) {
        newMap = data;
        connection = data.connection;
        player = data.player;
    }

    create() {

        map = this.make.tilemap({key: newMap.coords});

        var tiles = map.addTilesetImage('world', 'tiles');
        worldLayer = map.createDynamicLayer("worldLayer", tiles, 0, 0);
        obstacleLayer = map.createDynamicLayer("obstacleLayer", tiles, 0, 0);
        obstacleLayer.setCollisionByProperty({block: true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.socket = connection;
        this.otherPlayers = this.physics.add.group();
        this.socket.emit('playerMovedMap', {key: newMap.coords, recall: false});
        this.socket.on('currentPlayers', (players, recall) => {

            if (players[this.socket.id]) {
                if (recall === false) {
                    this.addPlayer(this, players[this.socket.id], '0-0', obstacleLayer);
                }
            }

            Object.keys(players).forEach((id) => {
                if (players[id].playerId !== this.socket.id) {
                    this.addOtherPlayers(this, players[id]);
                }
            });
        });
        this.socket.on('playerChangedPosition', (player) => {
            if (this.otherPlayers.getChildren().length === 0 && player.room === this.player.room) {
                this.addOtherPlayers(this, player);
            } else {
                this.otherPlayers.getChildren().forEach((otherPlayer) => {

                    if (player.playerId === otherPlayer.playerId) {
                        console.log('changed: ' + otherPlayer.playerId);

                        otherPlayer.room = player.room;
                        if (otherPlayer.room !== this.player.room) {
                            otherPlayer.destroy();
                        }
                    } else if (player.playerId === this.player.playerId) {
                        console.log('thats me');
                    } else {
                        if (player.room === this.player.room) {
                            this.addOtherPlayers(this, player);
                        }
                    }


                });
            }
        });
        this.socket.on('newPlayer', (playerInfo) => {
            this.addOtherPlayers(this, playerInfo);
        });
        this.socket.on('disconnect', (playerId) => {
            console.log('Gone:' + playerId);
            this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
        this.socket.on('playerMoved', (playerInfo) => {
            this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    if (playerInfo.room === this.player.room) {
                        if (playerInfo.direction.length > 0) {
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

        //this.scene.start('hudScene');
    }

    update(time, delta) {

        var speed = 50;

        if (this.player) {


            var x = this.player.x;
            var y = this.player.y;

            // Stop any previous movement from the last frame
            if (this.player.body) {
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

                var newMapCoords = this.player.room.split('-'),
                    newMapBeforeX,
                    newMapNextX,
                    newMapBeforeY,
                    newMapNextY;


                switch(newMapCoords[0]) {
                    case '0':
                        newMapBeforeX = 10;
                        newMapNextX = 1;
                        break;
                    case '1':
                        newMapBeforeX = 0;
                        newMapNextX = 2;
                        break;
                    case '2':
                        newMapBeforeX = 1;
                        newMapNextX = 3;
                        break;
                    case '3':
                        newMapBeforeX = 2;
                        newMapNextX = 4;
                        break;
                    case '4':
                        newMapBeforeX = 3;
                        newMapNextX = 5;
                        break;
                    case '5':
                        newMapBeforeX = 4;
                        newMapNextX = 6;
                        break;
                    case '6':
                        newMapBeforeX = 5;
                        newMapNextX = 7;
                        break;
                    case '7':
                        newMapBeforeX = 6;
                        newMapNextX = 8;
                        break;
                    case '8':
                        newMapBeforeX = 7;
                        newMapNextX = 9;
                        break;
                    case '9':
                        newMapBeforeX = 8;
                        newMapNextX = 10;
                        break;
                    case '10':
                        newMapBeforeX = 9;
                        newMapNextX = 0;
                        break;
                }

                switch(newMapCoords[1]) {
                    case '0':
                        newMapBeforeY = 10;
                        newMapNextY = 1;
                        break;
                    case '1':
                        newMapBeforeY = 0;
                        newMapNextY = 2;
                        break;
                    case '2':
                        newMapBeforeY = 1;
                        newMapNextY = 3;
                        break;
                    case '3':
                        newMapBeforeY = 2;
                        newMapNextY = 4;
                        break;
                    case '4':
                        newMapBeforeY = 3;
                        newMapNextY = 5;
                        break;
                    case '5':
                        newMapBeforeY = 4;
                        newMapNextY = 6;
                        break;
                    case '6':
                        newMapBeforeY = 5;
                        newMapNextY = 7;
                        break;
                    case '7':
                        newMapBeforeY = 6;
                        newMapNextY = 8;
                        break;
                    case '8':
                        newMapBeforeY = 7;
                        newMapNextY = 9;
                        break;
                    case '9':
                        newMapBeforeY = 8;
                        newMapNextY = 10;
                        break;
                    case '10':
                        newMapBeforeY = 9;
                        newMapNextY = 0;
                        break;
                }

                if (this.player.movement.direction === 'up') {
                    newMapKey = newMapCoords[0] + '-' + newMapBeforeY;
                } else if (this.player.movement.direction === 'down') {
                    newMapKey = newMapCoords[0] + '-' + newMapNextY;
                } else if (this.player.movement.direction === 'left') {
                    newMapKey = newMapBeforeX + '-' + newMapCoords[1];
                } else {
                    newMapKey = newMapNextX + '-' + newMapCoords[1];
                }

                this.scene.pause();
                var check = this.createNewMap(newMapKey, this);
                if (check) {
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

    createNewMap(key, self) {
        this.physics.world.colliders.destroy();
        var newMapObject = this.make.tilemap({key: key});
        var tiles = map.addTilesetImage('world', 'tiles');
        worldLayer = newMapObject.createDynamicLayer("worldLayer", tiles, 0, 0);
        obstacleLayer = newMapObject.createDynamicLayer("obstacleLayer", tiles, 0, 0);

        map = newMapObject;

        obstacleLayer.setCollisionByProperty({block: true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.socket.emit('playerMovedMap', {key: key, recall: true});
        this.addPlayer(self, self.player, key, obstacleLayer);
        return true;
    }

    addPlayer(self, playerInfo, newMap, obstacleLayer, recall) {

        if (!self.player) {
            self.player = self.physics.add.sprite(64, 64, "hunter").setScale(.5);
            self.physics.add.collider(self.player, obstacleLayer);
            self.cameras.main.startFollow(self.player);
            self.player.room = newMap;
            self.player.setDepth(1);
            self.player.playerObjects = playerInfo.playerObjects;

            this.scene.launch('hudScene');
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
            self.player.setPosition(x, y);
            self.player.room = newMap;
        }
    }

    addOtherPlayers(self, playerInfo) {
        if (self.player && playerInfo.room === self.player.room) {

            if(!playerInfo.x && !playerInfo.y) {
                playerInfo.x = 64;
                playerInfo.y = 64;
            }

            const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "hunter").setScale(.5);
            otherPlayer.playerId = playerInfo.playerId;
            self.otherPlayers.add(otherPlayer);
        }
    }
}