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
    x: width/2,
    y: height/2
  };

  var mouse = {
    x: 0,
    y: 0
  };
  var heading = 0;
  var armPosition = 0;
  var armForward = true;
  var walking = false;
  var personMoves = false;

  // visual customizations
  var updateInterval = 10;
  var headSize = 20;
  var armWidth = 10;
  var armLength = 8;
  var armSpeed = 1;
  var personSpeed = 2;
  var fontSize = 30;
  var defaultFont = fontSize + "px Open Sans";

  // colors
  var headColor = "#F5F5DC";
  var armColor = "#00CED1";
  var fontColor = "white";
  var confirmColor = "rgba(0, 255, 0, 0.1)";

  // example map
  var map = [
    {
      type: "text",
      x: 250,
      y: 250,
      content: "Hello, World!"
    },
    {
      type: "house",
      x: 500,
      y: 500,
      title: "This is a house",
      content: "Inside the house"
    }
  ];

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

  // draw function
  var draw = function() {
    ctx.clearRect(0, 0, width, height);

    // if person moves, update person position on move
    // else update object positions and keep person in center
    if(!personMoves) {
      var personTmp = person;
      person = {
        x: width/2,
        y: height/2,
        heading: person.heading
      };
    }
    
    // rotate canvas to draw person
    ctx.save();
    ctx.translate(person.x, person.y);
    ctx.rotate(person.heading);
    ctx.translate(-person.x, -person.y);

    // draw arms
    ctx.fillStyle = armColor;
    ctx.fillRect(
      Math.min(person.x - armWidth/2 + armPosition, person.x - armWidth/2),
      person.y - headSize/2 - armWidth,
      Math.abs(armPosition) + armWidth,
      armWidth);
     ctx.fillRect(
      Math.min(person.x - armWidth/2 - armPosition, person.x - armWidth/2),
      person.y + headSize/2,
      Math.abs(armPosition) + armWidth,
      armWidth);
      
    // draw head
    ctx.fillStyle = headColor;
    //ctx.fillRect(person.x - headSize/2, person.y - headSize/2, headSize, headSize);
    ctx.beginPath();
    ctx.arc(person.x, person.y, headSize*1.25/2, 0, Math.PI*2)
    ctx.closePath();
    ctx.fill();
      
    // unrotate canvas to draw person
    ctx.restore();
    if(!personMoves) {
      person = personTmp;
    }
    
    // draw map stuff
    for(var object of map) {
      var x = personMoves ? object.x : object.x - person.x + width/2;
      var y = personMoves ? object.y : object.y - person.y + height/2;
      
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

  // update person
  setInterval(() => {

    // walk update arm position
    if(armForward) {
      if(armPosition < armLength && (walking || !walking && armPosition != 0)) {
        armPosition += armSpeed;
      } else {
        armForward = false;
      }
    } else {
      if(armPosition > -armLength && (walking || !walking && armPosition != 0)) {
        armPosition -= armSpeed;
      } else {
        armForward = true;
      }
    }
    
    // update player heading
    person.heading = 
      personMoves ? (mouse.x < person.x ? Math.PI : 0) + Math.atan((mouse.y - person.y) / (mouse.x - person.x))
      : (mouse.x < width/2 ? Math.PI : 0) + Math.atan((mouse.y - height/2) / (mouse.x - width/2));
    
    // move person if walking
    if(walking) {
      person.x += personSpeed * Math.cos(person.heading);
      person.y += personSpeed * Math.sin(person.heading);
    }
    
  }, updateInterval);

  // get mouse position
  document.addEventListener("mousemove", (event) => {
    mouse = {
      x: event.pageX,
      y: event.pageY
    };
  });
  var mouseHandler = event => walking = event.type === "mousedown";
  document.addEventListener("mousedown", mouseHandler);
  document.addEventListener("mouseup", mouseHandler);

};
