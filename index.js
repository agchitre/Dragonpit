// Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/


const debugElement = document.getElementById('debugElement');
const frameHeight = 480;
const frames = 4;
const divDragon = document.getElementById("dragon");
let frame = 0;
const scale = 2;
const width = 200;
const height = 200;
const scaledWidth = scale * width;
const scaledHeight = scale * height;
var roar = new Audio('roar.mp3');
document.getElementById("image").style.visibility = "hidden"


let img = new Image();
img.src = 'dragon.png';
img.onload = function() {
  init();
};
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(img,
                  frameX * width, frameY * height, width, height,
                  canvasX, canvasY, scaledWidth, scaledHeight);
  }

const cycleLoop = [0, 1, 0, 2];
let currentLoopIndex = 0;
let frameCount = 0;

function step() {
  frameCount++;
  if (frameCount < 15) {
    window.requestAnimationFrame(step);
    return;
  }
  frameCount = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFrame(cycleLoop[currentLoopIndex], 0, 0, 0);
  currentLoopIndex++;
  if (currentLoopIndex >= cycleLoop.length) {
    currentLoopIndex = 0;
  }
  window.requestAnimationFrame(step);
}

function init() {
    window.requestAnimationFrame(step);
   
  }


/**
 * Append text or any object that can be stringified to the debug element
 * @param {any} msg 
 */
function printDebug( msg ) {
    if ( typeof(msg) !== 'string' ) {
        debugElement.append(JSON.stringify(msg,null,2));
    } else {
        debugElement.append(msg);
    }
    debugElement.append('\n');
    debugElement.scrollTo({top: debugElement.scrollHeight});
    console.log(msg);
}



/** @type {Alexa.AlexaClient} */
let alexaClient;
let wakeWord = "Alexa";

function beginApp() {
printDebug('Beginning Alexa.create');
Alexa.create({version: '1.1'})
    .then((args) => {
        if ( args.alexa ) {
            alexaClient = args.alexa;
            alexaClient.skill.onMessage(messageReceivedCallback);
            printDebug(`Alexa is ready :) Received initial data:`);
            printDebug(args.message);
            if ( args.message.hint ) {
                const match = /try\s+\"(\w*),/gi.exec(args.message.hint);
                if ( match ) {
                    printDebug(`discovered wake word: ${match[1]}`);
                    wakeWord = match[1];
                } 
            }
            setHints();
        } else {
            printDebug(`Alexa failed to initialize, code: ${args.code}`);
        }
    })
    .catch(error => {
        printDebug( 'Alexa not ready :(' );
        printDebug( error );
    });
}

// to avoid blocking the first paint, we start code after the first frame
requestAnimationFrame(beginApp);



/**
 * Setup the hints display on screen procedurally, so we can 
 * interpolate in the wakeword
 */
function setHints() {
    document.getElementById('hints').innerHTML = 
        `<p>Try saying <i>"${wakeWord}, Hello"</i>,</p>
        <p>or <i>"${wakeWord}, can you repeat..."</i> followed by something you'd like Alexa to say.</p>`
}



/**
 * Implements receiving a message from your skill backend
 * @param {any} message 
 */
function messageReceivedCallback(message) {
  // Process message (JavaScript object) from your skill
  printDebug('received a message from the skill endpoint');
  printDebug(message);
  if(message.userSpeech =='roar')
  {
    dragonroar();
  }
}

/**
 * Implements listening to the result of sending a message to your skill backend
 * @param {Alexa.MessageSendResult} result 
 */
const messageSentCallback = function(result) {
    if ( result.statusCode === 200 ) {
        printDebug(`message was sent to backend successfully`);
    } else {
        printDebug(`failed to send message to skill backend:`);
    }
    printDebug(result);
};

function dragonroar() {  
    roar.play(); 
    animateScript(); 
    stopAnimate();
}

/**
 * Wraps sending a message to your skill backend 
 * with our custom result callback function
 * @param {any} msg 
 */
function sendMessage(msg){
    printDebug(`sending message to skill endpoint:`);
    printDebug(msg);
    if ( alexaClient ) {
        alexaClient.skill.sendMessage(msg, messageSentCallback);
    } else {
        printDebug(`Alexa was not ready, could not send message:`);
        printDebug(msg);
    }
}

/*
  When handling touch events on Alexa screen devices, 
  you can skip the latency caused by browser support 
  for long presses by handling the down events directly.
  Be sure to preventDefault on touch events if you've also
  implemented mouse events for testing.
*/

function bindButton( name, func ) {
    const element = document.getElementById(name);
    element.addEventListener('mousedown', (ev) => {
        func();
    });
    
    element.addEventListener('touchstart', (ev) => {
        func();
        ev.preventDefault();
    });    
}

bindButton('helloButton', () => {
    sendMessage({speech:'Hello world', time: Date.now()});
});

bindButton('micButton', () => {
    if ( !alexaClient ) {
        printDebug('cannot open the microphone, Alexa is not ready');
        return;
    }
    
    printDebug('requesting the microphone open');
    alexaClient.voice.requestMicrophoneOpen({
        onOpened: () => printDebug('the microphone was opened'),
        onClosed: () => printDebug('the microphone was closed'),
        onError: (err) => {
            printDebug('failed to open the microphone:');
            printDebug(err);
        }
    })
});

//FIRE THROW
var tID; //we will use this variable to clear the setInterval()

function stopAnimate() {
  clearInterval(tID);
  document.getElementById("image").style.visibility = "hidden"; 

} //end of stopAnimate()


function animateScript() {
  var position = 256; //start position for the image slicer
  const interval = 100; //100 ms of interval for the setInterval()
  const diff = 256; //diff as a variable for position offset
  document.getElementById("image").style.visibility = "visible"; 
  tID = setInterval(() => {
  
    document.getElementById("image").style.backgroundPosition =
      `-${position}px 0px`;
    //we use the ES6 template literal to insert the variable "position"
    
    if (position < 1536) {
      position = position + diff;
    }
    //we increment the position by 256 each time
    else {
      position = 256;
    }
    //reset the position to 256px, once position exceeds 1536px
    
  }, interval); //end of setInterval
} //end of animateScript()

