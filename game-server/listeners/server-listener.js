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