var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')({
    transports: ['websocket'],
    listeners: []
});

app.use(express.static('./'));
//app.use(express.static('assets'));

//listen to Unity events on port 4567
io.attach(4567);

//Listen to server events on port 4568
server.listen(4568);

app.get('/', function(req, res)
{
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

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
