var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')({
    transports: ['websocket']
});
var clients = [];
var master = null;

require('dns').lookup(require('os').hostname(), function (err, add, fam)
{
    console.log('listening on ' + add + ' : 4567');
});

//listen to Unity events on port 4567
io.attach(4567);
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
        let address = socket.handshake.address;
        if (master === null)
        {
            io.to(socket.id).emit('error_gameNotStarted');
        }
        else
        {
            for (let i = clients.length - 1; i >= 0; i--)
            {
                let e = clients[i];
                if (e.id === socket.id)
                {
                    //already joined
                    io.to(socket.id).emit('error_alreadyJoined');
                    return false;
                }
                if (client_name === e.name)
                {
                    //name already used.
                    io.to(socket.id).emit('error_usernameTaken');
                    return false;
                }
                if (address === e.address)
                {
                    clients.splice(i, 1);
                    io.to(master).emit('exit_game', e);
                }
            }
            let client = {name: client_name, id: socket.id, address: socket.handshake.address};
            clients.push(client);
            io.to(master).emit('join_game', client);
            io.to(socket.id).emit('success_joinedGame');
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
            for (let i = clients.length - 1; i >= 0; i--)
            {
                let e = clients[i];
                if (e.id === socket.id)
                {
                    clients.splice(i, 1);
                    io.to(master).emit('exit_game', e);
                }
            }
        }
    })
});
