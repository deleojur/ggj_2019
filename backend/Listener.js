var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')({
    transports: ['websocket']
});
var clients = [];
var colors = [0xFF0500, 0xFF6A00, 0xFFDA00, 0x5CFF00, 0xFFF100, 0x00FF8C, 0x00EEFF, 0x0055FF, 0x7500FF, 0xDF00FF, 0xFF0081];
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

    socket.on('player_input', function(o)
    {
        o.id = socket.id;
        io.to(master).emit('player_input', o);
    });

    socket.on('waiting_for_game', function()
    {
        console.log('waiting for game');
        io.to(clients[0].id).emit('client_waiting_for_game');
    });

    socket.on('start_game', function()
    {
        console.log('start game');
        io.to(clients[0].id).emit('client_start_game');
    });

    socket.on('join_game', function()
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
                if (address === e.address)
                {
                    clients.splice(i, 1);
                    io.to(master).emit('exit_game', e);
                }
                if (e.id === socket.id)
                {
                    //already joined
                    io.to(socket.id).emit('error_alreadyJoined');
                    return false;
                }
            }
            let client = {id: socket.id, address: socket.handshake.address};
            clients.push(client);
            io.to(master).emit('join_game', client);
            io.to(socket.id).emit('success_joinedGame', colors[clients.length - 1]);
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
