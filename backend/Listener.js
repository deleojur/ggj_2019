var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')({
    transports: ['websocket'],
    listeners: []
});

//listen to Unity events on port 4567
io.attach(4567);

//Listen to server events on port 4568
server.listen(4568);

app.get('/join_game', function (req, res)
{
    if (io.isInitialized)
    {
        res.send('Waiting for other players...');
    } else res.send('Not so fast, Buster!');
});

app.get('/start_game', function (req, res)
{
    if (io.listeners.length > 1)
    {
        res.send('let\'s start that game!');
    } else res.send('You want to play by yourself?');
});

io.on('connection', function(socket)
{
    //this is where Unity connects to the server.
    socket.on('beep', function()
    {
        io.isInitialized = true;
		socket.emit('boop');
	});
})
