//const { getDisplayName } = require("next/dist/next-server/lib/utils");

let data; // json data
let input; // input field
let sendBttn; // send button
let answer = ""; // answer from the chatbot
let funBttn; // generates a random fun idea
let photoBttn;  // takes a photo
let dogBttn;  // plays dog sound
let dogSound;

// for photobooth feature tracking
let capture; // our video capture object
let poseNet; // our ml5 detector
// an array of poses that get detected (human body features & their locations)
let poses = [];
// flag indicating that the model is ready to go
let readyToGo = false;

let tabX;
let tabY;
let tabSize;
let inputX;
let inputY;
let inputWidth;

// detect if user drags tab or hovers over icon
let overHeader = false;
let locked = false;
let xOffset = 0.0;
let yOffset = 0.0;

let currentApp = 'chat';
let headers;
let navLabels;
let icons;
let apps = [];
let navbar;
let newFont;
let doge;
let shiba;
let undertaleDog;
let heart;

let dogPics = [];

let funIdeas = [
  'picnic in washington square park',
  "wander aimlessly through trader joe's",
  'pull a bobst all-nighter',
  'learn underwater basket weaving',
  'take a ceramics class',
  'play cards at a cafe',
  'go ice skating at central park',
  'bake some banana bread',
  'attend a zine fest (or make a zine!)',
  'read each other your favorite books',
  'make friendship bracelets',
  'go to an open mic night',
  'watch glass animals music videos',
  'go on a bike ride (maybe not in nyc...)',
  'walk on the pier at sunset',
  'go to a concert!',
  'check out a cute bakery or boba place!'
];
let kaomoji = [
  '(* ^ ω ^)',
  '(´ ∀ ` *)',
  '٩(◕‿◕｡)۶',
  '☆*:｡.o(≧▽≦)o.｡*☆',
  '(o^▽^o)',
  '(⌒▽⌒)☆',
  '<(￣︶￣)>',
  '。.:☆*:･(*⌒―⌒*)',
  'ヽ(・∀・)ﾉ',
  '(´｡• ω •｡`)',
  '	ヽ(*・ω・)ﾉ',
  '(☆▽☆)',
  'o(>ω<)o'
];
let currIdea = funIdeas[0];
let currEmoji = kaomoji[0];
let ideaColor;

let compliments = [
  'the extent of your beauty literally does not compute',
  "the way you smile at the ground gets me overwhelmed",
  "i'll miss you when the humans are finally extinct -- wait oops lol jk",
  'take a selfie,, you know you want to',
  'there is not a single person on earth who would not be blessed by your presence',
  'the only thing that would make this image better is some dog pictures!!',
  'you got this! i believe in you',
  'you are stunning!!! 1000000/10',
  "what a beautiful amazing talented smart person you are",
  'you are the cutest person i have ever seen'
];
let currCompliment = compliments[5];

let intro = "HI! IM BFFBOT, YOUR VIRTUAL BEST FRIEND! I'M ALWAYS HERE IF YOU NEED SOMEONE TO CHEER YOU UP OR KEEP YOU COMPANY! LET'S CHAT ABOUT YOUR DAY :)\n-------------";

//load the JSON file and media
function preload() {
  data = loadJSON("chatbots.json");

  tab = loadImage('img/window.png');
  navbar = loadImage('img/navbar.png');
  doge = loadImage('img/doge.png');
  shiba = loadImage('img/shiba.png');
  undertaleDog = loadImage('img/undertale dog.png');
  heart = loadImage('img/heart.png');

  dogSound = loadSound('happy bark.mp3');
  newFont = loadFont('Dhurjati-Regular.ttf');

  headers = {
    chat: loadImage('img/headers/chat.png'),
    funIdeas: loadImage('img/headers/fun ideas.png'),
    photoBooth: loadImage('img/headers/photobooth.png'),
    dogPics: loadImage('img/headers/dog pics.png')
  };
  navLabels = {
    chat: loadImage('img/headers/chat.png'),
    funIdeas: loadImage('img/headers/fun ideas.png'),
    photoBooth: loadImage('img/headers/photobooth.png'),
    dogPics: loadImage('img/headers/dog pics.png')
  };
  icons = {
    chat: loadImage('img/icons/chat.png'),
    funIdeas: loadImage('img/icons/fun ideas.png'),
    photoBooth: loadImage('img/icons/photobooth.png'),
    dogPics: loadImage('img/icons/dog pics.png')
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);

  // set sizes
  tabX = width/2;
  tabY = height * 0.45;
  tabSize = min(width, height) * 0.7;

  headers.chat.resize(0, tabSize/15);
  headers.funIdeas.resize(0, tabSize/15);
  headers.photoBooth.resize(0, tabSize/15);
  headers.dogPics.resize(0, tabSize/15);
  
  navLabels.chat.resize(width/7, 0);
  navLabels.funIdeas.resize(width/7, 0);
  navLabels.photoBooth.resize(width/7, 0);
  navLabels.dogPics.resize(width/7, 0);
  
  navbar.resize(width, 0);

  //input field
  input = createInput("");
  inputX = tabX - tabSize * 0.42;
  inputY = tabY + tabSize/2 - (85 + tabSize/22 * 1.25);
  inputWidth = tabSize * 0.75;
  input.size(inputWidth, 40);
  input.position(inputX, inputY);

  //button to send input
  sendBttn = createButton("SEND");
  sendBttn.size(100, tabSize/22 * 1.25);
  sendBttn.position(inputX, inputY + input.height + 8);
  sendBttn.mousePressed(answerMe); //callback to let the chatbot respond
  sendBttn.style('background-color', '#FFE4EE');
  sendBttn.style('border', '2px solid #ff85c0');
  sendBttn.style('font-size', tabSize/35 + 'px');

  //button to generate ideas
  funBttn = createButton("MORE IDEAS");
  funBttn.size(150, tabSize/22 * 1.25);
  funBttn.position(inputX, inputY + input.height + 8);
  funBttn.mousePressed(newFunIdea);
  funBttn.style('background-color', '#FFE4EE');
  funBttn.style('border', '2px solid #ff85c0');
  funBttn.style('font-size', tabSize/35 + 'px');
  ideaColor = color(random(215, 255), random(0, 50), random(100, 180));

  //button to take photo
  photoBttn = createButton("TAKE A PIC");
  photoBttn.size(100, tabSize/22 * 1.25);
  photoBttn.position(inputX, inputY + input.height + 8);
  photoBttn.mousePressed(takePhoto);
  photoBttn.style('background-color', '#FFE4EE');
  photoBttn.style('border', '2px solid #ff85c0');
  photoBttn.style('font-size', tabSize/35 + 'px');

  //button to pet dogs
  dogBttn = createButton("PET");
  dogBttn.size(100, tabSize/22 * 1.25);
  dogBttn.position(inputX, inputY + input.height + 8);
  dogBttn.mousePressed(playDogSound);
  dogBttn.style('background-color', '#FFE4EE');
  dogBttn.style('border', '2px solid #ff85c0');
  dogBttn.style('font-size', tabSize/35 + 'px');

  // create apps
  let chat = new App('chat', height/15, height/10);
  let funIdeas = new App('fun ideas', height/15, height/10 + height/6);
  let photoBooth = new App('photobooth', height/15, height/10 + height/6 * 2);
  let dogPics = new App('dog pics', height/15, height/10 + height/6 * 3);
  apps.push(chat);
  apps.push(funIdeas);
  apps.push(photoBooth);
  apps.push(dogPics);

  // create our capture object
  capture = createCapture(VIDEO);
  capture.size(tabSize * 0.82, tabSize);
  // set up ml5 to look for human body features in the capture object
  // call the 'modelReady' function when the model has been loaded and is ready to go
  poseNet = ml5.poseNet(capture, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas (we will draw the video to the canvas ourselves)
  capture.hide();
}

function draw() {
  background('#EBF0FF');
  textAlign(LEFT, CENTER);
  textSize(tabSize/22);
  textFont(newFont);

  // draw window outline and navbar
  imageMode(CENTER);
  image(tab, tabX, tabY, tabSize, tabSize);
  imageMode(CORNER);
  image(navbar, 0, height - navbar.height * 0.87);

  // time in bottom right
  textAlign(RIGHT, CENTER)
  textStyle(BOLD);
  fill(0);

  let time = '';

  if (hour() < 12) {
    time += hour() + ':';
  } else {
    time += hour() - 12 + ':';
  }
  
  if (minute() > 9) {
    time += minute();
  } else {
    time += '0' + minute();
  }

  if (hour() < 12) {
    time += ' AM';
  } else {
    time += ' PM';
  }

  text(time, width * 29/30, height - navbar.height * 0.65);
  
  // display all app icons and the current app in window
  for (let i = 0; i < apps.length; i++) {
    apps[i].display();
  }

  // reposition buttons and input as window moves
  inputX = tabX - tabSize * 0.42;
  inputY = tabY + tabSize/2 - (85 + tabSize/22 * 1.25);
  input.position(inputX, inputY);
  sendBttn.position(inputX, inputY + input.height + 8);
  funBttn.position(inputX, inputY + input.height + 8);
  dogBttn.position(inputX, inputY + input.height + 8);
  photoBttn.position(inputX, inputY + input.height + 8);

  // cursors!
  if (overHeader || apps[0].mouseOverIcon() || apps[1].mouseOverIcon() ||
    apps[2].mouseOverIcon() || apps[3].mouseOverIcon()) {
    cursor(HAND);
  } else {
    // custom cursor for dog pics page
    if (currentApp == 'dog pics') {
      noCursor();
      image(doge, mouseX, mouseY, 20, 20);
    } else {
      cursor(ARROW);
    }
  }
}

function answerMe() {
  //prepare the input string for analysis
  let inputStr = input.value();
  inputStr = inputStr.toLowerCase();

  //loop through the answers array and match responses to triggers
  loop1: for (let i = 0; i < data.brain.length; i++) {
    loop2: for (let j = 0; j < data.brain[i].triggers.length; j++) {
      if (inputStr.indexOf(data.brain[i].triggers[j]) !== -1) {
        answer = random(data.brain[i].responses);
        break loop1;
      } else {
        answer = random(data.catchall);
      }
    }
  }
}

function newFunIdea() {
  currIdea = random(funIdeas);
  currEmoji = random(kaomoji);
  ideaColor = color(random(215, 255), random(0, 50), random(100, 180));
}

function takePhoto() {
  saveCanvas('photobooth', 'jpg');
}

function playDogSound() {
  dogSound.play(0, 0.6, 0.1, 1.6, 1);
}

function modelReady() {
  console.log("Poses ready!");
  readyToGo = true;
}

function mousePressed() {
  for (let i = 0; i < apps.length; i++) {
    apps[i].mousePressedIcon(mouseX, mouseY);
    apps[i].mousePressedHeader(mouseX, mouseY);
  }

  locked = overHeader;
  xOffset = mouseX - tabX;
  yOffset = mouseY - tabY;
}

function mouseDragged() {
  if (locked) {
    tabX = mouseX - xOffset;
    tabY = mouseY - yOffset;
  }
}

function mouseReleased() {
  locked = false;
}

class App {
  constructor(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    if (this.name == 'chat') {
      this.img = icons.chat;
    } else if (this.name == 'fun ideas') {
      this.img = icons.funIdeas;
    } else if (this.name == 'photobooth') {
      this.img = icons.photoBooth;
    } else {
      this.img = icons.dogPics;
    }
    this.img.resize(0, height/7);
    this.width = this.img.width;
    this.height = this.img.height;
  }

  display() {
    // show icon on desktop
    imageMode(CENTER);
    image(this.img, this.x, this.y);

    // if this is current app, display contents in tab
    if (currentApp == this.name) {
      // test if the cursor is over the header
      if (mouseX > tabX - tabSize/2 && mouseX < tabX + tabSize/2 &&
        mouseY > tabY - tabSize/2 && mouseY < tabY - tabSize/2 + tabSize/9 && !locked) {
          overHeader = true;
      } else {
        overHeader = false;
      }

      if (this.name == 'chat') {
        // header and navbar label
        image(headers.chat, tabX - tabSize * 0.22, tabY - tabSize * 0.445);
        image(navLabels.chat, width/12, height - navbar.height/2);

        // chat text
        fill("black");
        textAlign(LEFT, CENTER);
        textLeading(tabSize/25);

        text(intro, inputX, tabY - tabSize * 0.35, inputWidth);
        
        // display the answer from the chatbot
        text(answer.toUpperCase(), inputX, tabY - tabSize * 0.15, inputWidth);
        
        // show input and sendbttn
        input.show();
        sendBttn.show();
        // hide other buttons
        funBttn.hide();
        dogBttn.hide();
        photoBttn.hide();

      } else if (this.name == 'fun ideas') {
        // header and navbar label
        image(headers.funIdeas, tabX - tabSize * 0.22, tabY - tabSize * 0.445);
        image(navLabels.funIdeas, width/12, height - navbar.height/2);

        // fun ideas text
        textAlign(LEFT);
        textSize(tabSize/13);
        textLeading(tabSize/16);
        fill(ideaColor);
        text(currIdea.toUpperCase(), inputX, tabY - tabSize * 0.35, inputWidth);
        textFont('Helvetica');
        text(currEmoji, inputX, tabY - tabSize * 0.15, inputWidth);
        fill(0);

        // show funbttn
        funBttn.show();
        // hide input and other buttons
        input.hide();
        sendBttn.hide();
        dogBttn.hide();
        photoBttn.hide();

      } else if (this.name == 'photobooth') {
        // header and navbar label
        imageMode(CENTER);
        image(headers.photoBooth, tabX - tabSize * 0.22, tabY - tabSize * 0.445);
        image(navLabels.photoBooth, width/12, height - navbar.height/2);

        // We can call both functions to draw all keypoints and the skeletons
        if (readyToGo) {
          imageMode(CORNER);
          let captureX = tabX - (tabSize/2) * 0.895;
          let captureY = tabY - (tabSize/2) * 0.75;
          image(capture, captureX, captureY);

          // figure out where the user's eyes are
          if (poses.length > 0 && poses[0].pose.nose) {
            let noseX = poses[0].pose.nose.x;
            let noseY = poses[0].pose.nose.y;
    
            for (let i = 0; i < 7; i++) {
              let heartX = 1.1 * (noseX + tabSize/16 * (4 - i));
              let heartY = noseY + tabSize/80 * abs((i-3) * (i-3));
              
              image(heart, captureX + heartX - tabSize/12 - noseX/8, 
                captureY + heartY - tabSize/2, tabSize/20, tabSize/20);
              if (currCompliment == compliments[5]) {
                image(doge, captureX + heartX - tabSize/12 - noseX/8, 
                  captureY + heartY - tabSize * 0.58, tabSize/20, tabSize/20);
              }
            }
          }

          // give compliments
          fill(0);
          textSize(tabSize/22);
          textFont(newFont);
          textLeading(tabSize/25);
          textAlign(LEFT);
          text(currCompliment.toUpperCase(), inputX, tabY + tabSize * 0.265, inputWidth);

          if (frameCount % 500 == 0) {
            currCompliment = random(compliments);
          }
        }
        else {
          textAlign(CENTER);
          fill(0);
          text("MODEL LOADING", width/2, height/2);
        }

        // show photoBttn
        photoBttn.show();
        // hide input and buttons
        input.hide();
        sendBttn.hide();
        funBttn.hide();
        dogBttn.hide();

      } else {  // dog pics
          // header and navbar label
        image(headers.dogPics, tabX - tabSize * 0.22, tabY - tabSize * 0.445);
        image(navLabels.dogPics, width/12, height - navbar.height/2);

        fill(map(dogPics.length, 0, 600, 0, 255));
        let message = 'the dogs are sending you good fortune and eternal happiness';
        push();
        textAlign(CENTER, CENTER);
        textSize(tabSize/10);
        textLeading(tabSize/15);
        text(message, tabX - tabSize * 0.4, tabY - tabSize/10, inputWidth);
        pop();

        if (dogPics.length < 600) {
          let pic = [random([doge, shiba, undertaleDog]), 
          random(tabX - tabSize * 0.42, tabX + tabSize * 0.35), 
          random(tabY - tabSize * 0.35, tabY + tabSize * 0.42)];
          dogPics.push(pic);
        }

        for (let i = 0; i < dogPics.length; i++) {
          image(dogPics[i][0], dogPics[i][1], dogPics[i][2], 20, 20);
          dogPics[i][1]++;
          if (dogPics[i][1] > tabX + tabSize * 0.35) {
            dogPics[i][1] = tabX - tabSize * 0.42;
            dogPics[i][2] = random(tabY - tabSize * 0.35, tabY + tabSize * 0.42);
          }
        }

        // show dogbttn
        dogBttn.show();
        // hide input and other buttons
        input.hide();
        sendBttn.hide();
        funBttn.hide();
        photoBttn.hide();

      }
    }
  }

  mouseOverIcon() {
    // check if mouse is over icon
    if (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 &&
      mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2) {
        return true;
    } else {
        return false;
    }
  }

  mousePressedIcon(clickX, clickY) {
    // check if the mouse actually interacted with this app icon
    if (clickX > this.x - this.width/2 && clickX < this.x + this.width/2 &&
      clickY > this.y - this.height/2 && clickY < this.y + this.height/2) {
        currentApp = this.name;
    }
  }

  mousePressedHeader(clickX, clickY) {
    // check if the mouse actually interacted with this app icon
    if (clickX > this.x - this.width/2 && clickX < this.x + this.width/2 &&
      clickY > this.y - this.height/2 && clickY < this.y + this.height/2) {
        currentApp = this.name;
    }
  }
}