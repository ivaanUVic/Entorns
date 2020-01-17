var blobs = [];
var blobs_eat = [];
var limit = 3000;
function Blob(id, x, y, r,blobs) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.blobs = blobs;
}

var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, listen);

// Ens avisa quan s'enjega el servidor
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://' + host + ':' + port);
  for (var i = 0; i < 200; i++) {
    var x = getRandomArbitrary(-limit, limit);
    var y = getRandomArbitrary(-limit, limit);
    blobs_eat[i] = new Blob(ID(),x, y, 10,[]);
    //console.log(blobs_eat);
  }
  
}
var getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}
var ID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};
app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
  io.sockets.emit('heartbeat', blobs);
  //console.log(blobs);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function(data) {
     
      console.log(socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r );
      
      var blob = new Blob(socket.id, data.x, data.y, data.r,blobs_eat);
      
      blobs.push(blob);
      

    });

    socket.on('update', function(data) {
      //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
      var blob;
      for (var i = 0; i < blobs.length; i++) {
        if (socket.id == blobs[i].id) {
          blob = blobs[i];
        }
      }
      blob.x = data.x;
      blob.y = data.y;
      blob.r = data.r;
      blob.blobs = blobs_eat;
      //if(data.blobs){
        
      //}else{
      //  blobs.blobs = blobs_eat;
      //}
     
    });
    socket.on('eat', function(id) {
      var cont = 0;
      for (var i = 0; i < blobs_eat.length; i++) {
        if (id == blobs_eat[i].id) {
          blobs_eat.splice(i,1);
          cont ++;
          
          console.log("blob eated");
        }
      }
      for(var i = 0; i<cont; i++){
        blobs_eat.push(new Blob(ID(),getRandomArbitrary(-limit, limit), getRandomArbitrary(-limit, limit), 10,[])); 
        console.log("blob created");
      }
    });
    socket.on('kill', function(id) {
      for (var i = 0; i < blobs.length; i++) {
        if (id == blobs[i].id) {
          blobs.splice(i,1);
          console.log("blob KILLED");
        }
      }
    });
    socket.on('disconnect', function() {
      for (var i = 0; i < blobs.length; i++) {
        if (socket.id == blobs[i].id) {
          blobs.splice(i,1);
          console.log("blob deleted");
        }
      }
      console.log('Client has disconnected');
    });
  }
);
