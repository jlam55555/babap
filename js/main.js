// connect to socket.io
var socket = io.connect("https://babap-server.herokuapp.com/");

// run on window load
window.onload = () => {

  // get canvas
  var canvas = document.querySelector("#canvas");
  var ctx = canvas.getContext("2d");
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;

  // basic variables
  var person = {
    x: 0,
    y: 0
  };
  var map = [];

  // visual customizations
  var fontSize = 30;
  var defaultFont = fontSize + "px Open Sans";
  var personMoves = false;
  var headSize = 20;
  var armWidth = 10;

  // colors
  var headColor = "#F5F5DC";
  var armColor = "#00CED1";
  var fontColor = "white";
  var confirmColor = "rgba(0, 255, 0, 0.1)";

  // house for drawing
  var drawHouse = function(x, y, title) {
    ctx.fillStyle = "rgba(127, 127, 127, 0.75)";
    ctx.fillRect(x-50, y-75, 100, 150);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.moveTo(x-50, y-75);
    ctx.lineTo(x, y-65);
    ctx.lineTo(x, y+65);
    ctx.lineTo(x-50, y+75);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "rgba(30, 30, 30, 0.75)";
    ctx.beginPath();
    ctx.moveTo(x+50, y-75);
    ctx.lineTo(x, y-65);
    ctx.lineTo(x, y+65);
    ctx.lineTo(x+50, y+75);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "rgba(200, 30, 30, 0.75)";
    ctx.fillRect(x, y+70, 30, 20);
    
    ctx.font = defaultFont;
    ctx.fillStyle = fontColor;
    ctx.fillText(title, x-ctx.measureText(title).width/2, y-75-fontSize);
  };

  // person for drawing
  var drawPerson = function(person) {
    // rotate canvas to draw person
    ctx.save();
    ctx.translate(person.x, person.y);
    ctx.rotate(person.heading);
    ctx.translate(-person.x, -person.y);

    // draw arms
    ctx.fillStyle = armColor;
    ctx.fillRect(
      Math.min(person.x - armWidth/2 + person.armPosition, person.x - armWidth/2),
      person.y - headSize/2 - armWidth,
      Math.abs(person.armPosition) + armWidth,
      armWidth);
     ctx.fillRect(
      Math.min(person.x - armWidth/2 - person.armPosition, person.x - armWidth/2),
      person.y + headSize/2,
      Math.abs(person.armPosition) + armWidth,
      armWidth);
      
    // draw head
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(person.x, person.y, headSize*1.25/2, 0, Math.PI*2)
    ctx.closePath();
    ctx.fill();
      
    // unrotate canvas to draw person
    ctx.restore();
  };

  // draw function
  var draw = function() {
    ctx.clearRect(0, 0, width, height);

    // draw map stuff
    for(var object of map) {
      var x = personMoves ? object.x : object.x - person.x + width/2;
      var y = personMoves ? object.y : object.y - person.y + height/2;
      
      // person
      if(object.type === "person") {

        // draw person
        var objectCopy = Object.assign({}, object);
        objectCopy.x = x;
        objectCopy.y = y;
        drawPerson(objectCopy);
      }

      // text
      if(object.type === "text") {
        ctx.fillStyle = fontColor;
        ctx.font = object.font || defaultFont;
        ctx.fillText(object.content, x, y);
      }
      
      // house
      if(object.type === "house") {
        
        // if person is near house
        if(Math.abs(person.x - object.x) < 100 && Math.abs(person.y - object.y) < 125) {
          ctx.fillStyle = confirmColor;
          ctx.fillRect(x - 100, y - 125, 200, 250);
        }
        
        // draw house
        drawHouse(x, y, object.title);
      }
      
    }
    
    requestAnimationFrame(draw);
  }
  draw();

  // get person updates
  socket.on("personUpdate", newPerson => {
    person = newPerson;
  });
  socket.on("mapUpdate", newMap => {
    map = newMap;
  });

  // update person heading 
  var updateHeading = function(mouse) {
    person.heading = 
      personMoves ? (mouse.x < person.x ? Math.PI : 0) + Math.atan((mouse.y - person.y) / (mouse.x - person.x))
      : (mouse.x < width/2 ? Math.PI : 0) + Math.atan((mouse.y - height/2) / (mouse.x - width/2));
    socket.emit("headingUpdate", person.heading);
  };
  document.addEventListener("touchmove", event => {
    var touch = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    updateHeading(touch);
  });
  document.addEventListener("mousemove", event => {
    var mouse = {
      x: event.pageX,
      y: event.pageY
    };
    updateHeading(mouse);
  });

  // update person walking
  var mouseHandler = event => {
    socket.emit("walkingUpdate", event.type === "mousedown" || event.type === "touchstart");
  }
  document.addEventListener("mousedown", mouseHandler);
  document.addEventListener("touchstart", mouseHandler);
  document.addEventListener("mouseup", mouseHandler);
  document.addEventListener("touchend", mouseHandler);

};
