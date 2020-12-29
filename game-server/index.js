const io        = require('socket.io');
var express     = require('express');
var app         = express();
var https       = require('https');
var http        = require('http');
const fs        = require('fs');
const listener  = require('./listeners/server-listener');

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