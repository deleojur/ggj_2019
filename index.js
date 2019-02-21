var io        = require('socket.io')(server);
const rand      = require('random-seed');
var express     = require('express');
var app         = express();
var http        = require('http');

var rooms       = { /*'undefined' : { clients: {}, master: 0} */ };
var server      = http.Server(app);
const PORT      = process.env.PORT || 5000;

app.use(express.static('world-of-paint/dist/world-of-paint'));

io = io.listen(server);
server.listen(PORT, function()
{

});

io.on('connection', function(socket)
{
    socket.on('master_enter_room',          master_enterRoom);
    socket.on('master_close_room',          master_closeRoom);

    //called when the master actually starts the match
    socket.on('master_start_match', ()       => master_startMatch(socket));
    socket.on('master_end_match',           master_endMatch);
    
    socket.on('client_update_avatar', (data)    => client_updateAvatar(socket, data));
    socket.on('client_gameroom_ready', (data)   => client_ready(socket, data));
    socket.on('client_start_countdown', ()          => client_startCountdown(socket));
    socket.on('client_cancel_countdown', () => client_cancelCountdown(socket));
    socket.on('client_update_location', (roomid, data) => client_updateLocation(roomid, socket.id, data));

    socket.on('master_create_room', ()      => master_createRoom(socket));
    socket.on('client_join_room', (data)    => client_joinRoom(socket, data));
    socket.on('disconnect', ()              => onDisconnected(socket));
});

function master_createRoom(socket)
{
    let master  = socket.id;
    let gen     = rand(master);
    let roomid  = -1;
    do
    {
        roomid  = gen.intBetween(10000, 99999);
    } while (typeof rooms[roomid] !== 'undefined');

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
    if (socket.roomid in rooms)
    {
        io.to(socket.roomid).emit('server_update', { 'msg' : 'match_started' });
    }
}

function master_endMatch()
{

}

function client_updateAvatar(socket, data)
{
    let roomid  = socket.roomid;
    let addr    = socket.addr;

    if (roomid in rooms)
    {
        data        = JSON.parse(data);
        data.addr   = addr; 
        io.to(rooms[roomid].master).emit('client_update_avatar', data);
    }
}

function client_ready(socket, data)
{
    let roomid = socket.roomid;
    data = JSON.parse(data);
    if (socket.roomid in rooms)
    {
        let clients = rooms[roomid].clients;
        if (clients.hasOwnProperty(socket.addr))
        {
            clients[socket.addr].isready = data.ready;
        }
        io.to(rooms[roomid].master).emit('client_gameroom_ready', { 'client': socket.addr, 'ready': data.ready });
        sendEveryoneReady(roomid);
    }
}

function sendEveryoneReady(roomid)
{
    let ready = isEveryoneReady(roomid);
    let data = {'msg' : 'everyone_ready', 'data' : ready};
    io.to(roomid).emit('server_update', data);
}

function isEveryoneReady(roomid)
{
    let ready = true;
    if (roomid in rooms)
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
        io.to(socket.roomid).emit('server_update', { 'msg' : 'start_countdown' });
    }
}

function client_cancelCountdown(socket)
{
    if (socket.roomid in rooms)
    {
        io.to(socket.roomid).emit('server_update', { 'msg': 'cancel_countdown' });
    }
}

//sockets can be distincted by two values: id and address.
//address is persistent through sessions, while id is session-dependent.
//however, id is used to communicate using socket.io.
function client_joinRoom(socket, data)
{
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
            if (clients.hasOwnProperty(property))
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

        io.to(data.id).to(master).emit('server_update', { 'msg': 'join_room', 'data': data });
        sendEveryoneReady(roomid);

        socket.join(roomid);
        socket.roomid = roomid;
        socket.addr = addr;
    }
};

function client_updateLocation(roomid, id, data)
{
    try
    {
        let master  = rooms[roomid].master;
        data.id     = id;
        socket.to(master).emit('client_uddateLocation', data);
    } catch(e)
    {
        //the room is most probably closed. Communicate this to the client.
    }
}

function onDisconnected(socket)
{
    let gen     = rand(socket.id);
    let roomid  = gen.intBetween(10000, 99999);
    if (roomid in rooms)
    {
        if (socket.id === rooms[roomid].master)
        {
            io.to(roomid).emit('server_update', { 'msg': 'master_disconnected' });
            console.log('room', roomid, 'is no longer available.');
            rooms[roomid] = undefined;
        } else
        {
            rooms[roomid].clients[socket.addr] = undefined;
            socket.leave(roomid);
        }
    }
};