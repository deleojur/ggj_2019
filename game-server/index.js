const io        = require('socket.io');
var express     = require('express');
var app         = express();
var https       = require('https');
var http        = require('http');
const listener  = require('./listeners/server-listener');
const fs = require("fs");
const path = require('path');

require('dns').lookup(require('os').hostname(), function (err, addr, fam) 
{
	fs.writeFile(path.join(__dirname, '../game-client/src/environments/environment-ip.ts'), `export const ip_config = { ws_url: 'http://${addr}:5000' }`, function (err) 
	{
		if (err) return console.log(err);
	});	
});

const PORT      = process.env.PORT || 5000;

const options = 
{
    //key: fs.readFileSync('./encryption/private.key', 'utf8'),
    //cert: fs.readFileSync('./encryption/world-of-paint.crt', 'utf8')
};

/** HTTP server */
var server = http.Server(app);
server.listen(PORT);

/** HTTPS server */
//var server = https.createServer(options, app).listen(PORT);

const ioServer = io(server, {pingTimeout: 30000});
listener.listen(ioServer);