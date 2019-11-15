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
            clients: {},
            connections: 0
        };
        socket.roomid = roomid;
        this.io.to(host).emit('server_room_created', {roomid: roomid});
        socket.join(roomid);
        console.log('room', roomid, 'created.');
    },
    host_startGame(data)
    {
        data = JSON.parse(data);
        const clients = data.clients;

        clients.forEach(client =>
        {
            this.io.to(client.id).emit('host_game_startLocation', { x: client.x, y: client.y });
        });
    },
    host_connection_lost(roomid)
    {
        this.io.to(roomid).emit('server_global_disconnected');
        delete this.rooms[roomid];
        console.log('room', roomid, 'is no longer available.');
    },
    listen(io, socket)
    {
        this.io = io;
        socket.on('host_room_createRoom', () => this.host_createRoom(socket));
        socket.on('host_game_startLocation', (clients) => this.host_startGame(clients));
    }
};
module.exports = listener;