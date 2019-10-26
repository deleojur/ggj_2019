const rand = require('random-seed');
listener = 
{
    initialize(rooms)
    {
        this.rooms = rooms;
    },
    client_connection_lost(socket, roomid)
    {
        this.io.to(this.rooms[roomid].host).emit('client_disconnected', { 'addr' : socket.addr });
        socket.leave(roomid);
        delete this.rooms[roomid].clients[socket.addr];
        console.log(socket.id, 'disconnected.');
    },
    //sockets can be distincted by two values: id and address.
    //address is persistent through sessions, while id is session-dependent.
    //however, id is used to communicate using socket.io.
    client_room_join(socket, data)
    {
        data = JSON.parse(data);
        const roomid = data.roomid;
        if (!(roomid in this.rooms))
        {
            //send a message to the client that the roomnumber is not valid.
            this.io.to(socket.id).emit('server_error', 'room_invalid');            
        }
        else 
        {            
            const room = this.rooms[roomid];
            const addr = socket.handshake.address;
            const host = room.host;

            data.id = socket.id;
            data.addr = addr;
            room.clients[addr] = data;

            this.io.to(host).emit('client_room_join', data);
            this.io.to(data.id).emit('client_room_join', data);
            socket.join(roomid);

            socket.roomid = roomid;
            socket.addr = addr;
            console.log('room', roomid, 'joined by', data.name);
        }
    },
    listen(io, socket)
    {
        this.io = io;
        socket.on('client_room_join', (data) => { this.client_room_join(socket, data); });
    }
};
module.exports = listener;