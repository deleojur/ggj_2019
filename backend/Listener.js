var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')({
    transports: ['websocket']
});

app.use(express.static('./'));

//listen to Unity events on port 4567
io.attach(4567);

//Listen for clients on port 4568
server.listen(4568, "127.0.0.1");

io.on('connection', function(socket)
{
    //this is where Unity connects to the server.
    socket.on('beep', function()
    {
        io.isInitialized = true;
		socket.emit('boop');
    });

    socket.on('join_game', function(somedata)
    {
        socket.broadcast.emit('join_game', somedata);
    });
});
