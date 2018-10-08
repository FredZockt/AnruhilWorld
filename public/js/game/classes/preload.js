class preloadScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'preloadScene'
        });
    }

    preload() {
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
        this.load.spritesheet('hunter', path + 'assets/sprites/hunter.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('farmer', path + 'assets/sprites/farmer.png', {frameWidth: 64, frameHeight: 64});

        for(var mapX = 0; mapX <= 10; mapX++) {
            for(var mapY = 0; mapY <= 10; mapY++) {
                this.load.tilemapTiledJSON(mapX+'-'+mapY, path + 'assets/json/'+mapX+'-'+mapY+'.json');
            }
        }

    }

    create() {

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
        this.scene.start('newPartScene', {
            player: this.player,
            coords: '0-0',
            x: 128,
            y: 128,
            direction: "",
            connection: this.socket
        });
    }
}