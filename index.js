'use-strict'
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);

app.use(cors());

var PORT = process.env.PORT || 3000;

const io = require('socket.io')(server, {
    cors: {
        origins: ['*']
    }
})


// Serve static files
app.use(express.static(__dirname + '/client/dist/client'));

// Send all requests to index.html
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/dist/client/index.html'));
});



io.on('connection', (socket) => {

    socket.on('find-driver', ({points}) => {
        console.log('......', points);

        const counter = setInterval(() => {
            const coords = points.shift();
            if (!coords) {
                clearInterval(counter)
            } else {
                socket.emit('position', {coords});
            }
        }, 1000)
    })
})

server.listen(PORT, () => console.log('SERVIDOR CORRIENDO EN EL PUERTO:' + PORT))