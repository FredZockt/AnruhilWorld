let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

let players = {};

// basic npc object
let npcs =[
    [
        [
            {
                id: "1001-npc",
                name: "George Wellington",
                sprite: "hunter",
                startPosition: "_stand_front",
                home: {
                    x: 14,
                    y: 7
                },
                believe: {
                    amount: 5,
                    isFalling: true
                },
                sleep: 100,
                current: {
                    position: {
                        x: 14,
                        y: 7,
                        animation: "_stand_front"
                    }
                }
            },
            {
                id: "1002-npc",
                name: "Peter Trumble",
                sprite: "farmer",
                startPosition: "_stand_front",
                home: {
                    x: 17,
                    y: 7
                },
                believe: {
                    amount: 70,
                    isFalling: true
                },
                sleep: 100,
                current: {
                    position: {
                        x: 17,
                        y: 7,
                        animation: "_stand_front"
                    }
                }
            }
        ]
    ]
];
// basic world objects
let worldObjects = [
    [
        [
            {
                id: "1001-wo",
                name: "George Wellington\'s Home",
                home: {
                    x: 14,
                    y: 7
                },
                ability: "sleep"
            },
            {
                id: "1002-wo",
                name: "Peter Trumble\'s Home",
                home: {
                    x: 17,
                    y: 7
                },
                ability: "sleep"
            },
            {
                id: "1003-wo",
                name: "Test Church",
                home: {
                    x: 14,
                    y: 15
                },
                ability: "believe"
            }
        ]
    ]
];

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    //random = socket.id;
    console.log('a user connected: ', socket.id);
    // create a new player and add it to our players object
    players[socket.id] = {
        playerId: socket.id,
        playerObjects: {
            inventory: [
                {id: 1001, amount: 1, stack: false, row: 1, slot: 1},
                {id: 1001, amount: 1, stack: false, row: 1, slot: 2},
                {id: 1001, amount: 1, stack: false, row: 1, slot: 3},
                {id: 1001, amount: 1, stack: false, row: 1, slot: 4},
                {id: 1001, amount: 1, stack: false, row: 2, slot: 1},
                {id: 1001, amount: 1, stack: false, row: 2, slot: 2},
                {id: 1001, amount: 1, stack: false, row: 2, slot: 3},
                {id: 1001, amount: 1, stack: false, row: 2, slot: 4},
                {id: 1001, amount: 1, stack: false, row: 3, slot: 1},
                {id: 1001, amount: 1, stack: false, row: 3, slot: 2},
                {id: 1001, amount: 1, stack: false, row: 3, slot: 3},
                {id: 1001, amount: 1, stack: false, row: 3, slot: 4},
                {id: 1001, amount: 1, stack: false, row: 4, slot: 1},
                {id: 1001, amount: 1, stack: false, row: 4, slot: 2},
                {id: 1001, amount: 1, stack: false, row: 4, slot: 3},
                false
            ],
            "quickSlots": [
                false,
                {ref: 2},
                {ref: 3},
                {ref: 4},
                {ref: 5},
                {ref: 6},
                {ref: 7},
                {ref: 8},
                {ref: 9},
                false,
            ]
        }
    };
    // send the players object to the new player
    //socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', () => {
        delete players[socket.id];
        console.log('a user disconnected: ', socket.id);
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', (movementData) => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].direction = movementData.direction;
        players[socket.id].room = movementData.room;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('playerMovedMap', (newRoom) => {
        players[socket.id].room = newRoom.key;
        socket.broadcast.emit('playerChangedPosition', players[socket.id]);
        socket.emit('currentPlayers', players, newRoom.recall);
    });

    socket.on('loadNpcs', (room) => {
        // first split the roomnumber to get all needed npcs from the global object
        let coordinates = room.room.split('-');
        let roomNpcs = npcs[coordinates[0]][coordinates[1]];
        let roomObjects = worldObjects[coordinates[0]][coordinates[1]];

        // emit the current needed npc to the player
        console.log('emit');
        socket.emit('currentNpcs', roomNpcs, roomObjects);
    });

});
setInterval(() => {
    for(let i = 0; i < npcs.length; i++) {
        for(let j = 0; j < npcs[i].length; j++) {
            for(let k = 0; k < npcs[i][j].length; k++) {
                console.log(npcs[i][j][k].believe.amount);
                if(npcs[i][j][k].believe.amount <= 0) {
                    npcs[i][j][k].believe.amount += 4;
                    npcs[i][j][k].believe.isFalling = false;
                    io.sockets.emit('moveNpc', npcs[i][j][k], worldObjects[i][j][2]);
                } else if(npcs[i][j][k].believe.amount > 100 && npcs[i][j][k].believe.isFalling === false) {
                    npcs[i][j][k].believe.isFalling = true;
                    io.sockets.emit('moveNpcHome', npcs[i][j][k], worldObjects[i][j]);
                } else if(npcs[i][j][k].believe.isFalling) {
                    npcs[i][j][k].believe.amount -= 1;
                } else if(npcs[i][j][k].believe.isFalling === false) {
                    npcs[i][j][k].believe.amount += 4;
                }
            }
            console.log('\n');
        }
    }
},1000);

server.listen(3000, () => {
    console.log(`Listening on ${server.address().port}`);
});
