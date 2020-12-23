const rand = require('random-seed');
const colors = ['#e6194b', '#000075', '#f58231', '#911eb4', '#4363d8', '#f58231'];
listener = 
{
    initialize(rooms)
    {
        this.rooms = rooms;
	},
	emit_to_host(socket, endpoint, data)
	{
		const roomid = socket.roomid;
        const room = this.rooms[roomid];
        if (room !== undefined)
        {
            data.id = socket.id;
            const host = room.host;
            this.io.to(host).emit(endpoint, data);
        }
	},
    client_connection_lost(socket, roomid)
    {
        const room = this.rooms[roomid];
        room.connections--;
        const client = room.clients[socket.id];
        client.status = 'left';
        this.io.to(this.rooms[roomid].host).emit('server_room_clientConnection', client);
        socket.leave(roomid);
        delete room.clients[socket.id];
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
            data.color = colors[room.connections++];
            
            room.clients[data.id] = data;
            
            data.status = 'joined';
            this.io.to(host).emit('server_room_clientConnection', data);
            //tell the client that their request to join has been validated.
            this.io.to(data.id).emit('server_room_validateJoin', data);
            socket.join(roomid);

            socket.roomid = roomid;
            console.log('room', parseInt(roomid), 'joined by', data.name);
        }
    },
    client_room_startGame(socket)
    {
        if (this.rooms[socket.roomid] !== undefined)
        {
            this.io.to(socket.roomid).emit('server_room_validateStartGame');
        }
	},
    client_game_turnConfirm(socket, data)
    {
		data = { turnConfirmed: JSON.parse(data) };
        this.emit_to_host(socket, 'client_game_turnConfirm', data);
	},
	client_game_sendTurnInformation(socket, data)
	{
		data = JSON.parse(data);
		this.emit_to_host(socket, 'client_game_sendTurnInformation', data);
	},
	client_verify_turnResolve(socket)
	{
		this.emit_to_host(socket, 'client_verify_turnsResolve', {});
	},
	client_request_cards(socket, data)
	{
		console.log('client -> request cards receieved', data);
		this.emit_to_host(socket, 'client_request_cards', JSON.parse(data))
	},
    listen(io, socket)
    {		
        this.io = io;
        socket.on('client_room_join', (data) => { this.client_room_join(socket, data); });
        socket.on('client_room_startGame', () => { this.client_room_startGame(socket); });
		socket.on('client_game_turnConfirm', (data) => this.client_game_turnConfirm(socket, data));
		socket.on('client_game_sendTurnInformation', (data) => this.client_game_sendTurnInformation(socket, data));
		socket.on('client_verify_turnsResolve', () => { this.client_verify_turnResolve(socket); });

		socket.on('client_request_cards', (data) => { this.client_request_cards(socket, data); });
    }
};
module.exports = listener;