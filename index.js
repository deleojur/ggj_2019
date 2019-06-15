var io        = require('socket.io')(server);
const rand      = require('random-seed');
var express     = require('express');
var app         = express();
var https       = require('https');
var http        = require('http');
const fs        = require('fs');

var rooms       = { };
const PORT      = process.env.PORT || 5000;

const options = 
{
    key: fs.readFileSync('./encryption/private.key', 'utf8'),
    cert: fs.readFileSync('./encryption/world-of-paint.crt', 'utf8')
};
app.use(express.static('world-of-paint/dist/world-of-paint'));
//var server      = http.Server(app);
var server = https.createServer(options, app).listen(PORT);
io = io.listen(server);
io.on('connection', function(socket)
{
    socket.on('master_enter_room',          master_enterRoom);
    socket.on('master_close_room',          master_closeRoom);

    //called when the master actually starts the
    socket.on('master_start_match', ()       => master_startMatch(socket));
    socket.on('master_end_match', (data)           => master_endMatch(socket, data));
    socket.on('master_client_joined', (data) => master_clientJoined(socket, data));
    
    socket.on('master_update_client_stats', (data) => master_updateClientStats(socket, data));

    socket.on('client_update_avatar', (data)    => client_updateAvatar(socket, data));
    socket.on('client_gameroom_ready', (data)   => client_ready(socket, data));

    socket.on('client_pause_match', () => client_pauseMatch(socket));
    socket.on('client_resume_match', () => client_resumeMatch(socket));
    socket.on('client_restart_match', () => client_restartMatch(socket));
    
    socket.on('client_return_to_room', () => client_returnToRoom(socket));
    socket.on('client_start_countdown', ()          => client_startCountdown(socket));
    socket.on('client_cancel_countdown', () => client_cancelCountdown(socket));
    
    socket.on('client_update_location', (data) => client_updateLocation(socket, data));

    socket.on('master_create_room', ()      => master_createRoom(socket));
    socket.on('client_join_room', (data)    => client_joinRoom(socket, data));
    socket.on('disconnect', ()              => onDisconnected(socket));
});

function master_clientJoined(socket, data)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(rooms[socket.roomid].clients[data.addr].id).emit('client_join_room', data);
    }
}

function master_createRoom(socket)
{
    let master  = socket.id;
    let gen     = rand(master);
    let roomid  = -1;
    do
    {
        roomid  = gen.intBetween(11111, 99999);
    } while (rooms[roomid] !== undefined);
    
    //create a new entry for the master that connected.
    rooms[roomid] = 
    { 
        master: master, 
        clients: {}
    };
    console.log('create room', roomid);

    socket.roomid = roomid;
    io.to(master).emit('server_room_created', {roomid: roomid});
    socket.join(roomid);
}

function master_enterRoom(roomid)
{

}

function master_closeRoom()
{

}

function master_startMatch(socket)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(socket.roomid).emit('server_match_started');
    }
}

function master_endMatch(socket, data)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(socket.roomid).emit('server_match_ended', data);
    }
}

function master_updateClientStats(socket, data)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        for (let i = 0; i < data.length; i++)
        {
            let packet = data[i];
            io.to(packet.id).emit('client_update_stats', packet);
        }
    }
}

function client_pauseMatch(socket)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        io.to(roomid).emit('server_pause_match', { 'addr' : socket.addr });
    }
}

function client_resumeMatch(socket)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        io.to(roomid).emit('server_resume_match', { 'addr' : socket.addr });
    }
}

function client_restartMatch(socket)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        io.to(roomid).emit('server_start_countdown');
    }
}

function client_returnToRoom(socket)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        io.to(roomid).emit('server_return_to_room');
    }
}

function client_updateAvatar(socket, data)
{
    let roomid  = socket.roomid;
    let addr    = socket.addr;

    if (rooms[roomid] !== undefined)
    {
        data        = JSON.parse(data);
        data.addr   = addr; 
        data.id     = socket.id;
        io.to(rooms[roomid].master).emit('client_update_avatar', data);
    }
}

function client_ready(socket, data)
{
    let roomid = socket.roomid;
    data = JSON.parse(data);
    if (rooms[roomid] !== undefined)
    {
        let clients = rooms[roomid].clients;
        if (clients.hasOwnProperty(socket.addr))
        {
            clients[socket.addr].isready = data.ready;
        }
        io.to(rooms[roomid].master).emit('client_gameroom_ready', { 'addr': socket.addr, 'ready': data.ready });
        sendEveryoneReady(roomid);
    }
}

function sendEveryoneReady(roomid)
{
    let ready = isEveryoneReady(roomid);
    let data = {'ready' : ready};

    if (rooms[roomid] !== undefined)
    {
        if (Object.keys(rooms[roomid].clients).length > 1) //if there are at least two players
        {
            io.to(roomid).emit('server_everyone_ready', data);
        }
    }
}

function isEveryoneReady(roomid)
{
    let ready = true;
    if (rooms[roomid] !== undefined)
    {
        let clients = rooms[roomid].clients;

        //check if all players are ready.
        for (let property in clients)
        {
            if (clients.hasOwnProperty(property))
            {
                if (!clients[property].isready)
                {
                    ready = false;
                }
            }
        }
        return ready;
    }
    return false;
}

function client_startCountdown(socket)
{
    if (isEveryoneReady(socket.roomid))
    {
        io.to(socket.roomid).emit('server_start_countdown');
    }
}

function client_cancelCountdown(socket)
{
    if (socket.roomid in rooms)
    {
        io.to(socket.roomid).emit('server_cancel_countdown');
    }
}

//sockets can be distincted by two values: id and address.
//address is persistent through sessions, while id is session-dependent.
//however, id is used to communicate using socket.io.
function client_joinRoom(socket, data)
{
    console.log('client join room!');
    data = JSON.parse(data);
    let roomid = data.roomid;
    if (!(roomid in rooms))
    {
        //send a message to the client that the roomnumber is not valid.
        io.to(socket.id).emit('server_error', 'room_invalid');
    }
    else 
    {
        let clients = rooms[roomid].clients;
        for (let property in clients)
        { 
            if (clients[property] !== undefined)
            {
                if (clients[property].playername === data.playername)
                {
                    io.to(data.id).emit('server_error', 'name_taken');
                }
            }
        }

        let room = rooms[roomid];
        let addr = socket.handshake.address, master = room.master;
        data.id = socket.id, data.addr  = addr;
        room.clients[addr]              = data;
        room.clients[addr].isready      = false;

        io.to(master).emit('client_join_room', data);
        sendEveryoneReady(roomid);

        socket.join(roomid);
        socket.roomid = roomid;
        socket.addr = addr;
    }
};

function client_updateLocation(socket, data)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        data = JSON.parse(data);

        let master = rooms[socket.roomid].master;
        data.addr = socket.addr;
        io.to(master).emit('client_update_input', data);
    }
}

function onDisconnected(socket)
{
    let gen     = rand(socket.id);
    let roomid  = gen.intBetween(11111, 99999);
    if (rooms[roomid] !== undefined)
    {
        if (socket.id === rooms[roomid].master)
        {
            io.to(roomid).emit('master_disconnected');
            console.log('room', roomid, 'is no longer available.');
            delete rooms[roomid];
        }
    } else if (rooms[socket.roomid] !== undefined)
    {
        delete rooms[socket.roomid].clients[socket.addr];
        io.to(rooms[socket.roomid].master).emit('client_disconnected', { 'addr' : socket.addr });
        socket.leave(socket.roomid);
    }
};