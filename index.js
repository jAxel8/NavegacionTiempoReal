'use-strict'
const path = require('path');
const express = require('express');
const https = require("https");
const url = https;
const app = express();
const server = require('http').Server(app);


var PORT = process.env.PORT || 3000;

var io = require('socket.io')(server,{
    cors: { origin: '*'}
});


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
    
});



// Serve static files
app.use(express.static(__dirname + '/client/dist/client'));

// Send all requests to index.html
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/dist/client/index.html'));
});

server.listen(PORT, () => {console.log('SERVIDOR CORRIENDO EN EL PUERTO:' + PORT)


io.on('connection',function(socket){
    socket.on('find-driver',({points}) =>{
        console.log('....',points);
        
        const counter = setInterval(() =>{
            const coords = points.shift();
            if(!coords){
                clearInterval(counter)
            }else{
                io.emit('position',{coords});
            }
        },1200)
    })
})


})