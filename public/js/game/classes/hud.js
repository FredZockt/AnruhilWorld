class hudScene extends Phaser.Scene {

    constructor () {
        super({
            key: 'hudScene',
            active: true
        });
    }

    create () {

        let inventoryOpen = false;

        // set a simple button to activate the inventory
        const inventoryButton = this.add.text( ( gameWidth - 100), 10, 'Inventory', { fill: '#0f0', backgroundColor: '#f00' } );
        inventoryButton.setInteractive();
        this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

        inventoryButton.on('pointerdown', () => {
            if(!inventoryOpen) {
                inventoryOpen = true;
                this.inventoryMenu(inventoryOpen);

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
        for(let i = 1; i < 11; i++) {
            quickAccessBarSlots[i] = this.add.graphics();
            quickAccessBarSlots[i].fillStyle(0x0000ff, .5);
            quickAccessBarSlots[i].fillRect( ((gameWidth/2)-392)+(((i-1)*64)+((i-1)*16)), gameHeight-96, 64, 64);
            quickAccessBarSlots[i].setInteractive(new Phaser.Geom.Rectangle(((gameWidth/2)-392)+(((i-1)*64)+((i-1)*16)), gameHeight-96, 64, 64), Phaser.Geom.Rectangle.Contains);
            quickAccessBarSlots[i].on('pointerdown', () => {
                console.log('Slot: ' + i);
            });
        }

        let newPart = this.scene.get('newPartScene');
        console.log(newPart);


    }

    inventoryMenu (state) {

        if(state) {
            this.inventory = this.add.graphics();
            this.inventory.fillStyle(0x00ff00, .5);
            this.inventory.fillRect( (gameWidth/2)-152, (gameHeight/2)-152, 336, 336);

            // full inventory slots
            for(let x = 1; x < 5; x++) {
                inventorySlots[x] = [];
                for(let y = 1; y < 5; y++) {
                    inventorySlots[x][y] = this.add.graphics();
                    inventorySlots[x][y].fillStyle(0x00ff00, .5);
                    inventorySlots[x][y].fillRect( (gameWidth/2)-136+((x-1)*64)+((x-1)*16), (gameHeight/2)-136+((y-1)*64)+((y-1)*16), 64, 64);
                    inventorySlots[x][y].setInteractive(new Phaser.Geom.Rectangle((gameWidth/2)-136+((x-1)*64)+((x-1)*16), (gameHeight/2)-136+((y-1)*64)+((y-1)*16), 64, 64), Phaser.Geom.Rectangle.Contains);
                    inventorySlots[x][y].on('pointerdown', () => {
                        console.log('Reihe: ' + y + ' Slot: ' + x);
                    });
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