const rand = require('random-seed'); 
listener =
{
    initialize(rooms)
    {
        this.rooms = rooms;
    },
    host_createRoom(socket)
    {
        const host  = socket.id;
        const gen   = rand(host);
        let roomid  = -1;
        do
        {
            roomid  = gen.intBetween(11111, 99999);
        } while (this.rooms[roomid] !== undefined);
        
        //create a new entry for the host that connected.
        this.rooms[roomid] = 
        { 
            host: host, 
            clients: {}
        };
        socket.roomid = roomid;
        this.io.to(host).emit('server_room_created', {roomid: roomid});
        socket.join(roomid);
        console.log('room', roomid, 'created.');
    },
    host_connection_lost(roomid)
    {
        this.io.to(roomid).emit('host_disconnected');
        delete this.rooms[roomid];
        console.log('room', roomid, 'is no longer available.');
    },
    listen(io, socket)
    {
        this.io = io;
        socket.on('host_room_create', () => this.host_createRoom(socket));
    }
};
module.exports = listener;