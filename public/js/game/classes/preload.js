class preloadScene extends Phaser.Scene {

    constructor () {
        super({
            key: 'preloadScene'
        });
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
        // tile sprite
        this.load.image('tiles', 'assets/sprites/world.png');

        // character sprites
        this.load.spritesheet('hunter', path + 'assets/sprites/hunter.png', { frameWidth: 64, frameHeight: 64 } );

        // first layer of world json
        this.load.tilemapTiledJSON('center', path + 'assets/json/0-0.json');
        //this.load.tilemapTiledJSON('0-10', path + 'assets/json/0-10.json');

    }

    create () {
        function addPlayer (self, playerInfo) {
            console.log(self);
            if(playerInfo.room === "0-0" && self.physics.add != null) {
                self.player = self.physics.add.sprite(128, 128, "hunter").setScale(.5);
                self.physics.add.collider(self.player, obstacleLayer);
                self.cameras.main.startFollow(self.player);
            }
        }

        function addOtherPlayers (self, playerInfo, room = false) {
            if(!room) {
                room = '0-0';
            }

            if(room === '0-0') {
                const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "hunter").setScale(.5);
                otherPlayer.playerId = playerInfo.playerId;
                self.otherPlayers.add(otherPlayer);
            }
        }
        /*
        map = this.make.tilemap({ key: 'center' });
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
*/
        var controlConfig = {
            camera: this.cameras.main,
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            b: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
            speed: 1,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        };
        controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

        this.anims.create({
            key: 'hunter_stand_front',
            frames: this.anims.generateFrameNumbers('hunter', {start: 130, end: 130}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'hunter_run_up',
            frames: this.anims.generateFrameNumbers('hunter', {start: 105, end: 111}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'hunter_run_left',
            frames: this.anims.generateFrameNumbers('hunter', {start: 117, end: 125}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'hunter_run_right',
            frames: this.anims.generateFrameNumbers('hunter', {start: 143, end: 151}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'hunter_run_down',
            frames: this.anims.generateFrameNumbers('hunter', {start: 131, end: 137}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'farmer_stand_front',
            frames: this.anims.generateFrameNumbers('farmer', {start: 130, end: 130}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'farmer_run_up',
            frames: this.anims.generateFrameNumbers('farmer', {start: 105, end: 111}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'farmer_run_left',
            frames: this.anims.generateFrameNumbers('farmer', {start: 117, end: 125}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'farmer_run_right',
            frames: this.anims.generateFrameNumbers('farmer', {start: 143, end: 151}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'farmer_run_down',
            frames: this.anims.generateFrameNumbers('farmer', {start: 131, end: 137}),
            frameRate: 10,
            repeat: -1
        });


        var self = this;
        this.socket = io();
        /*
        this.otherPlayers = this.physics.add.group();
        this.socket.emit('currentPlayers');
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function(id) {
                if(players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id], obstacleLayer);
                } else {
                    addOtherPlayers(self, players[id]);
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
        */
        this.scene.start('newPartScene', { player: this.player, coords: '0-0', x: 128, y: 128, direction: "", connection: this.socket });
        //this.scene.shutdown();
    }

    update (time, delta) {
/*
        var speed = 500;

        if(this.player) {

            var x = this.player.x;
            var y = this.player.y;
            let newMapKey;

            // Stop any previous movement from the last frame
            this.player.body.setVelocity(0);

            // check for faster walking
            var tile = map.getTileAt(map.worldToTileX(x), map.worldToTileY(y), true, 0);
            if(tile.properties.way) {
                speed += 50;
            }

            this.player.movement = {
                direction: ""
            }

            // Movement
            if (controls.left.isDown) {
                this.player.body.setVelocityX(-speed);
                this.player.anims.play("hunter_run_left", true);
                this.player.movement.direction = "left";
            } else if (controls.right.isDown) {
                this.player.body.setVelocityX(speed);
                this.player.anims.play("hunter_run_right", true);
                this.player.movement.direction = "right";
            }else if (controls.up.isDown) {
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

            if(tile.properties.loadNewPart) {
                if(this.player.movement.direction === 'up') {
                    newMapKey = map.properties.top;
                } else if(this.player.movement.direction === 'down') {
                    newMapKey = map.properties.bottom;
                } else if(this.player.movement.direction === 'left') {
                    newMapKey = map.properties.left;
                } else {
                    newMapKey = map.properties.right;
                }

                this.socket.emit('playerMovedMap', {key: newMapKey});
                this.scene.start('newPartScene', { player: this.player, coords: newMapKey, x: this.player.x, y: this.player.y, direction: this.player.movement.direction, connection: this.socket });
            }

            // emit player movement
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, direction: this.player.movement.direction, room: newMapKey});
            }
            // save old position data
            this.player.oldPosition = {
                x: this.player.x,
                y: this.player.y
            };

        }

/*
        console.log(self);
        var speed = 175,
        prevVelocity = this.player.body.velocity.clone();

        // Stop any previous movement from the last frame
        player.body.setVelocity(0);

        // Horizontal movement
        if (controls.left.isDown) {
            player.body.setVelocityX(-speed);
            player.anims.play("hunter_run_left");
        } else if (controls.right.isDown) {
            player.body.setVelocityX(speed);
            player.anims.play("hunter_run_right");
        }

        // Vertical movement
        if (controls.up.isDown) {
            player.body.setVelocityY(-speed);
            player.anims.play("hunter_run_up");
        } else if (controls.down.isDown) {
            player.body.setVelocityY(speed);
            player.anims.play("hunter_run_down");
        }
        */

    }
}