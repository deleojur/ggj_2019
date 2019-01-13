var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')({
    transports: ['websocket']
});
var clients = [];
var master = null;

app.use(express.static('./'));

//listen to Unity events on port 4567
io.attach(4567);

//Listen for clients on port 4568
server.listen(4568, "127.0.0.1");

io.on('connection', function(socket)
{
    //this is where Unity connects to the server.
    socket.on('create_game', function()
    {
        io.isInitialized = true;
        master = socket.id;
    });

    socket.on('join_game', function(client_name)
    {
        if (master === null)
        {
            io.to(socket.id).emit('message', 'no master lives');
        }
        else if (clients.indexOf(socket.id) < 0)
        {
            clients.push(socket.id);
            let client = {name: client_name, id: socket.id};
            io.to(master).emit('join_game', client);
            io.to(socket.id).emit('message', 'master lives');
        }
    });

    socket.on('disconnect', function()
    {
        if (socket.id === master)
        {
            io.emit('close_game');
            master = null;
            clients = [];
        } else
        {
            //remove the specific client.
            //figure out a way to reconnect to previous session with the same ID.
            clients.splice(clients.indexOf(socket.id), 1);
        }
    })
});
