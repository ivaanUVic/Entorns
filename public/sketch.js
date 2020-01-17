var socket;

var blob;
var blobs_eat = [];
var blobs = [];
var zoom = 1;

function setup() {
  createCanvas(600, 600);

  socket = io.connect('http://entorns-final.herokuapp.com:3000');

  blob = new Blob(random(width), random(height), random(16, 24));
  // Make a little object with  and y
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    blobs: blobs_eat
  };

  socket.emit('start', data);

  socket.on('heartbeat', function(data) {
    //console.log(data);
    blobs = data;
  });
}

function draw() {
  background(0);
  //console.log(blob.pos.x, blob.pos.y);

  translate(width / 2, height / 2);
  var newzoom = 64 / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);

  for (var i = blobs.length - 1; i >= 0; i--) {
    var id = blobs[i].id;
    blobs_eat = blobs[i].blobs;
    if (id.substring(2, id.length) !== socket.id) {
      fill(0, 0, 255);
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);
      fill(255);
      textAlign(CENTER);
      textSize(4);
      text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);

      for (var j = blobs_eat.length - 1; j >= 0; j--) {
        var b = new Blob(blobs_eat[j].x,blobs_eat[j].y,blobs_eat[j].r );
        b.show();
        if (blob.eats(b)) {
          socket.emit('eat', blobs_eat[j].id);
          blobs_eat.splice(j, 1);
          //break;
        }
      }
      
        
    }
    if(id !== socket.id){
      var b = new Blob(blobs[i].x,blobs[i].y,blobs[i].r)
      if (blob.eats(b)) {
        console.log("mata");
        socket.emit('kill', blobs[i].id);
      }
    }
    
     //blobs[i].show();
     
  }

  blob.show();
  if (mouseIsPressed) {
    blob.update();
  }
  blob.constrain();

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    blobs: blobs_eat
  };
  socket.emit('update', data);
}
