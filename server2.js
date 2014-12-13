// SERVER

var http  = require('http')
  , fs    = require('fs')
  , path  = require('path')
  , mime  = require('mime')
  , cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

var server = http.createServer(function(request, response) {
  var filePath = false;
  if (request.url == '/') {
    filePath = 'index2.html';
  } else {
    filePath = request.url;
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

server.listen(8080, function() {
  console.log("Server listening on port 8080.");
});

// track votes
var votes1 = 0;
var votes2 = 0; 

// use socket.io
var io = require('socket.io').listen(server);

// arduino vars
var five = require("johnny-five"),
    bumper1, bumper2, led1, led2, test,
    board = new five.Board();



//turn off debug
io.set('log level', 1);

// define interactions with client
io.sockets.on('connection', function(socket){


    //send data to client    
   /* board.on('voteTally1', function(){
        
        socket.emit('vote1', votes1);
        console.log('sent vote1 data!')

    }); */
    
    board.on('voteTally1', function(){
       
        socket.emit('voteTally1', votes1);
        console.log('sent vote1 data!');

    });

    board.on('voteTally2', function(){ //function activated from bumper2 board.emit function.
        
        
        socket.emit('voteTally2', votes2); //pass votesTally2 onto the client with Votes2 data.
        console.log('sent vote2 data!');
    });
    
});


board.on("ready", function() {
  bumper1 = new five.Button(7);
  bumper2 = new five.Button(6);
  led1 = new five.Led(13);
  led2 = new five.Led(12);
 
  bumper1.on("hit", function() {
    votes1 += 10;  
    // led1.off(); 
    // led2.on(); 
    board.emit('voteTally1'); 
    console.log('button 1 pressed'); 
    console.log(votes1); 
  }); 

  bumper2.on("hit", function() {
    votes2 += 10;
    // led1.on();
    // led2.off();
    board.emit('voteTally2'); //activates function that it is matched to.
    console.log('button 2 pressed'); 
    console.log(votes2); 
  }); 
  });



// });