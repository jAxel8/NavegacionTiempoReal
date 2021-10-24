'use-strict'
const path = require('path');
const express = require('express');

const app = express();
const server = require('http').Server(app);


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


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
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