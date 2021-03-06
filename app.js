var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
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
            quickSlots: [
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
    socket.on('disconnect', function () {
        delete players[socket.id];
        console.log('a user disconnected: ', socket.id);
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        console.log(movementData);
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].direction = movementData.direction;
        players[socket.id].room = movementData.room;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('playerMovedMap', function(newRoom) {
        players[socket.id].room = newRoom.key;
        socket.broadcast.emit('playerChangedPosition', players[socket.id]);
        socket.emit('currentPlayers', players, newRoom.recall);
    })

});

server.listen(3000, function () {
    console.log(`Listening on ${server.address().port}`);
});
