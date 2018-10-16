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
    }

    update(time, delta) {

        var speed = 250;

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
        if(newMapObject.createDynamicLayer("objectsLayer", tiles, 0, 0)) {
            objectsLayer = newMapObject.createDynamicLayer("objectsLayer", tiles, 0, 0);
        }

        map = newMapObject;

        obstacleLayer.setCollisionByProperty({block: true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.socket.emit('playerMovedMap', {key: key, recall: true});
        this.addPlayer(self, self.player, key, obstacleLayer);
        return true;
    }

    addPlayer(self, playerInfo, newMap, obstacleLayer, recall) {

        if (!self.player) {
            const spawnPoint = map.findObject("objectsLayer", obj => obj.name === "spawn");
            self.player = self.physics.add.sprite( (spawnPoint.x+12), spawnPoint.y, "hunter").setScale(.5).setOrigin(.5, .5);
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

        this.addNpcs();
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

    addNpcs() {
        // include easystar
        this.finder = new EasyStar.js();

        // custom tileIdFinder
        this.finder.getTileID = function(x, y){
            var tile = map.getTileAt(x, y, true, 0);
            return tile.index;
        };

        // basic npc
        this.npc = this.physics.add.sprite( 362, 64, "hunter").setScale(.5).setOrigin(.5, .5);
        this.physics.add.collider(this.npc, obstacleLayer);

        // get complete grid of the map
        let grid = [];
        for(let y = 0; y < map.height; y++){
            let col = [];
            for(let x = 0; x < map.width; x++){
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)
                col.push(this.finder.getTileID(x,y));
            }
            grid.push(col);
        }
        this.finder.setGrid(grid);

        // create acceptable tiles
        let tileset = map.tilesets[0];
        let properties = tileset.tileProperties;
        let acceptableTiles = [];

        for(let i = tileset.firstgid-1; i < tileset.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if(!properties.hasOwnProperty(i)) {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i+1);
                continue;
            }
            if(properties[i]) {
                if(!properties[i].block) {
                    acceptableTiles.push(i+1);
                }
            }
            if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        this.finder.setAcceptableTiles(acceptableTiles);

        // find path method
        this.finder.findPath(Math.floor(362/32), Math.floor(64/32), Math.floor(460/32), Math.floor(224/32), ( path ) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                console.log(path);
                this.moveCharacter(path);
            }
        });
        this.finder.calculate();
    }

    moveCharacter (path) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        let tweens = [];
        for(let i = 0; i < path.length-1; i++){
            let ex = path[i+1].x + .5;
            let ey = path[i+1].y + .5;
            tweens.push({
                targets: this.npc,
                x: {value: ex*map.tileWidth, duration: 2000},
                y: {value: ey*map.tileHeight, duration: 2000},
                callback: () => {
                    if(this.npc.x > ex*map.tileWidth) {
                        this.npc.anims.play(this.npc.texture.key+'_run_left');
                    } else if(this.npc.x < ex*map.tileWidth) {
                        this.npc.anims.play(this.npc.texture.key+'_run_right');
                    } else if(this.npc.y > ey*map.tileHeight) {
                        this.npc.anims.play(this.npc.texture.key+'_run_up');
                    } else if(this.npc.y < ey*map.tileHeight) {
                        this.npc.anims.play(this.npc.texture.key+'_run_down');
                    }
                }
            });
        }

        this.tweens.timeline({
            tweens: tweens
        }).setCallback('onComplete', () => {
            console.log('Done, now emit to server');
            this.npc.anims.play(this.npc.texture.key+'_stand_front');
        });
    }

}