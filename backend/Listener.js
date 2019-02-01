var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
const PORT = process.env.PORT || 4567;
var io = require('socket.io')({
    transports: ['websocket']
});
var clients = [];
var colors = [0xFF000C, 0xFFEC00, 0x00FF1A, 0x00FAFF];
var master = null;

require('dns').lookup(require('os').hostname(), function (err, add, fam)
{
    console.log('listening on ' + add + ' : ' + PORT);
});

//listen to Unity events on port PORT
io.attach(PORT);
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
        let color = 0;
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
                    color = colors[i];
                    clients.splice(i, 1);
                    io.to(master).emit('exit_game', e);
                }
            }
            let client = {id: socket.id, address: socket.handshake.address};
            clients.push(client);
            io.to(master).emit('join_game', client);
            if (color === 0)
                color = colors[clients.length - 1];
            io.to(socket.id).emit('success_joinedGame', color);
        }
    });

    socket.on('game_round_ended', function()
    {
        clients = [];
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
                    io.to(master).emit('exit_game', e);
                }
            }
        }
    })
});
