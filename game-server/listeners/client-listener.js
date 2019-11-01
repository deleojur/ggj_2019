const rand = require('random-seed');
const colors = ['#e6194b', '#3cb44b', '#000075', '#f58231', '#911eb4', '#4363d8', '#f58231'];
listener = 
{
    initialize(rooms)
    {
        this.rooms = rooms;
    },
    client_connection_lost(socket, roomid)
    {
        const room = this.rooms[roomid];
        this.io.to(this.rooms[roomid].host).emit('server_room_clientLeft', room.clients[socket.id] );
        socket.leave(roomid);
        delete room.clients[socket.id];
        room.connections--;
        console.log(socket.id, 'disconnected.');
    },
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
            const host = room.host;

            data.id = socket.id;
            data.color = colors[room.connections];
            
            room.clients[data.id] = data;
            room.connections++;

            this.io.to(host).emit('server_room_clientJoined', data);
            this.io.to(data.id).emit('server_room_validateJoin', data);
            socket.join(roomid);

            socket.roomid = roomid;
            console.log('room', roomid, 'joined by', data.name);
        }
    },
    client_room_startGame(socket)
    {
        if (this.rooms[socket.roomid] !== undefined)
        {
            this.io.to(socket.roomid).emit('server_room_validateStartGame');
        }
    },
    listen(io, socket)
    {
        this.io = io;
        socket.on('client_room_join', (data) => { this.client_room_join(socket, data); });
        socket.on('client_room_startGame', () => { this.client_room_startGame(socket); });
    }
};
module.exports = listener;