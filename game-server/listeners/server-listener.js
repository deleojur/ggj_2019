const rand = require('random-seed');
const hostListener      = require('./host-listener');
const clientListener    = require('./client-listener');

var rooms = { };
/**
     * Socket calls are formatted as follows:
     *     1) who makes the call. Can be either client, host or server.
     *     2) state where the call originated from. Can be either room, match, pause, finish or global.
     *     3) the package type that will be delivered, this is always a verb.
     * For example: client_room_enter, where the roomid will be in the body.
     * Furher information will be in the json body of the message.
     */
listener =
{    
    onConnectionEstablished(io, socket)
    {
        hostListener.initialize(rooms);
        hostListener.listen(io, socket);

        clientListener.initialize(rooms);
        clientListener.listen(io, socket);
    },
    onConnectionLost(socket)
    {
        const roomid = socket.roomid;
        //if the socket id is the same as tne host id from the generated room, it must be 
        if (rooms[roomid] && socket.id === rooms[roomid].host)
        {
            hostListener.host_connection_lost(roomid);            
        //if the roomid of this socket exists and it is not the host, then it must be a client of that room. 
        } else if (rooms[roomid] !== undefined)
        {
            clientListener.client_connection_lost(socket, roomid);
        }
    },
    listen(io)
    {
        this.io = io;
        io.on('connection', socket => 
        { 
            this.onConnectionEstablished(io, socket);
            socket.once('disconnect', () => this.onConnectionLost(socket));
        });
    }
}
module.exports = listener;
/*
io.on('connection', socket =>
{
    //called by a connected client when in room state. Triggers a countdown before the match starts.
    socket.on('client_start_countdown', () => client_startCountdown(socket));
    //called by the client when countdown has been triggered. Causes the countdown to cease and return to default room state.
    socket.on('client_cancel_countdown', () => client_cancelCountdown(socket));

    socket.on('host_enter_room',          host_enterRoom);
    socket.on('host_close_room',          host_closeRoom);

    //called when the host actually starts the
    socket.on('host_start_match', ()       => host_startMatch(socket));
    socket.on('host_end_match', (data)           => host_endMatch(socket, data));
    socket.on('host_client_joined', (data) => host_clientJoined(socket, data));
    
    socket.on('host_update_client_stats', (data) => host_updateClientStats(socket, data));

    socket.on('client_update_avatar', (data)    => client_updateAvatar(socket, data));
    socket.on('client_gameroom_ready', (data)   => client_ready(socket, data));

    socket.on('client_pause_match', () => client_pauseMatch(socket));
    socket.on('client_resume_match', () => client_resumeMatch(socket));
    socket.on('client_restart_match', () => client_restartMatch(socket));
    
    socket.on('client_return_to_room', () => client_returnToRoom(socket));
    
    socket.on('client_update_location', (data) => client_updateLocation(socket, data));

    socket.on('client_join_room', (data)    => client_joinRoom(socket, data));
    socket.on('disconnect', ()              => onDisconnected(socket));
});

function host_clientJoined(socket, data)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(rooms[socket.roomid].clients[data.addr].id).emit('client_join_room', data);
    }
}

function host_createRoom(socket)
{
    let host  = socket.id;
    let gen     = rand(host);
    let roomid  = -1;
    do
    {
        roomid  = gen.intBetween(11111, 99999);
    } while (rooms[roomid] !== undefined);
    
    //create a new entry for the host that connected.
    rooms[roomid] = 
    { 
        host: host, 
        clients: {}
    };
    console.log('create room', roomid);

    socket.roomid = roomid;
    io.to(host).emit('server_room_created', {roomid: roomid});
    socket.join(roomid);
}

function host_enterRoom(roomid)
{

}

function host_closeRoom()
{

}

function host_startMatch(socket)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(socket.roomid).emit('server_match_started');
    }
}

function host_endMatch(socket, data)
{
    if (rooms[socket.roomid] !== undefined)
    {
        io.to(socket.roomid).emit('server_match_ended', data);
    }
}

function host_updateClientStats(socket, data)
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
        io.to(rooms[roomid].host).emit('client_update_avatar', data);
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
        io.to(rooms[roomid].host).emit('client_gameroom_ready', { 'addr': socket.addr, 'ready': data.ready });
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

function client_updateLocation(socket, data)
{
    let roomid = socket.roomid;
    if (rooms[roomid] !== undefined)
    {
        data = JSON.parse(data);

        let host = rooms[socket.roomid].host;
        data.addr = socket.addr;
        io.to(host).emit('client_update_input', data);
    }
}
*/