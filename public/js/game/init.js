const gameWidth = $(document).outerWidth(),
    gameHeight = $(document).outerHeight();

const path = '';

const config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    backgroundColor: '#5696A6',
    parent: 'world',
    scene: [preloadScene, newPartScene],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            }
        }
    }
};

let game = new Phaser.Game(config), map, controls, player, newMap, newMapKey, connection, self, obstacleLayer,
    worldLayer;