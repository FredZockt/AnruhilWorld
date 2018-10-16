class hudScene extends Phaser.Scene {

    constructor () {
        super({
            key: 'hudScene'
        });
    }

    create () {

        let inventoryOpen = false;
        let otherScene = this.scene.get('newPartScene');
        let playerObjects = otherScene.player.playerObjects;

        // set a simple button to activate the inventory
        const inventoryButton = this.add.text( ( gameWidth - 100), 10, 'Inventory', { fill: '#0f0', backgroundColor: '#f00' } );
        inventoryButton.setInteractive();
        this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

        inventoryButton.on('pointerdown', () => {
            if(!inventoryOpen) {
                inventoryOpen = true;
                this.inventoryMenu(inventoryOpen, playerObjects.inventory);

            } else {
                inventoryOpen = false;
                this.inventoryMenu(inventoryOpen);
            }
        });

        // basic quick access bar buttons for the bottom of the screen
        const quickAccessBar = this.add.graphics();
        let quickAccessBarSlots = [];
        quickAccessBar.fillStyle(0x441b00, .5);
        quickAccessBar.fillRect( (gameWidth/2)-408, gameHeight-112, 816, 96);

        // for each slot one rect with 16 px gap to each side
        for(let i = 0; i < 10; i++) {
            if(playerObjects.quickSlots[i]) {
                quickAccessBarSlots[i] = this.add.image(((gameWidth / 2) - 360) + (((i) * 64) + ((i) * 16)), gameHeight - 64, playerObjects.inventory[playerObjects.quickSlots[i].ref].id);
                quickAccessBarSlots[i].setInteractive();
            } else {
                quickAccessBarSlots[i] = this.add.graphics();
                quickAccessBarSlots[i].fillStyle(0x0000ff, .5);
                quickAccessBarSlots[i].fillRect(((gameWidth / 2) - 392) + (((i) * 64) + ((i) * 16)), gameHeight - 96, 64, 64);
                quickAccessBarSlots[i].setInteractive(new Phaser.Geom.Rectangle(((gameWidth / 2) - 392) + (((i) * 64) + ((i) * 16)), gameHeight - 96, 64, 64), Phaser.Geom.Rectangle.Contains);

            }
            quickAccessBarSlots[i].on('pointerdown', () => {
                console.log('Slot: ' + i);
            });
        }
    }

    inventoryMenu (state, objects) {

        if(state) {
            this.inventory = this.add.graphics();
            this.inventory.fillStyle(0x00ff00, .5);
            this.inventory.fillRect( (gameWidth/2)-152, (gameHeight/2)-152, 336, 336);

            // full inventory slots
            let k = 0;
            for(let x = 1; x < 5; x++) {
                inventorySlots[x] = [];
                for(let y = 1; y < 5; y++) {
                    if(objects[k]) {
                        inventorySlots[x][y] = this.add.image((gameWidth / 2) - 168 + ((x) * 64) + ((x - 1) * 16), (gameHeight / 2) - 168 + ((y) * 64) + ((y - 1) * 16), objects[k].id);
                        inventorySlots[x][y].setInteractive();
                        console.log('Item Found');
                    } else {
                        inventorySlots[x][y] = this.add.graphics();
                        inventorySlots[x][y].fillStyle(0xf000f0, .5);
                        inventorySlots[x][y].fillRect((gameWidth / 2) - 136 + ((x - 1) * 64) + ((x - 1) * 16), (gameHeight / 2) - 136 + ((y - 1) * 64) + ((y - 1) * 16), 64, 64);
                        inventorySlots[x][y].setInteractive(new Phaser.Geom.Rectangle((gameWidth / 2) - 136 + ((x - 1) * 64) + ((x - 1) * 16), (gameHeight / 2) - 136 + ((y - 1) * 64) + ((y - 1) * 16), 64, 64), Phaser.Geom.Rectangle.Contains);
                        console.log('No Item');
                    }
                    inventorySlots[x][y].on('pointerdown', () => {
                        console.log('Slot: ' + y + ' Reihe: ' + x);
                    });
                    k++;
                }
            }

        } else {
            this.inventory.destroy();
            for(let x = 1; x < 5; x++) {
                for(let y = 1; y < 5; y++) {
                    inventorySlots[x][y].destroy();
                }
            }

        }
    }


}