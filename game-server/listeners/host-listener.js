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
    host_startGame(socket, data)
    {
        data = JSON.parse(data);
		const clients = data.clients;
		const roomid = socket.roomid;

		console.log('host started game!');
		this.io.to(roomid).emit('host_startGame', { clients: clients });
        //TODO: send list of all players + start Locations
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
		socket.on('host_startGame', (clients) => this.host_startGame(socket, clients));
		//socket.on('client');
    }
};
module.exports = listener;