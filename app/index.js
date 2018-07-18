import document from "document";
import { inbox } from "file-transfer"
import clock from "clock";
import * as messaging from "messaging";
import { HeartRateSensor } from "heart-rate";
import { today } from 'user-activity';
import { charger } from "power";
import { battery } from "power";


let weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


let clockFront = document.getElementById("clock-front");
let clockBack = document.getElementById("clock-back");
clock.granularity = "minutes"; // seconds, minutes, hours

let dayFront = document.getElementById("day-front");
let dayBack = document.getElementById("day-back");
let btIcon = document.getElementById("battery-icon");

let stepNum = document.getElementById("step-num");
let calNum = document.getElementById("cal-num");

clock.ontick = function(evt) {
  let clockText = ("0" + evt.date.getHours()).slice(-2) +
                      ("0" + evt.date.getMinutes()).slice(-2);
  clockFront.text = clockText;
  clockBack.text = clockText;
  
  // if(evt.date.getSeconds() % 9 == 0) {
    // hrm.start();
    // updateActivity();
  // }
  
  // if(evt.date.getMinutes() % 15 == 0) {
    // updateBattery();
    // updateBgImage();
  // }
  
  // TODO correct?
  if(evt.date.getHours() == 0 && evt.date.getMinutes() == 0) {
    updateDay(evt.date);
  }
};

function updateDay(date) {
  console.log("updateDay");
  let n = weekday[date.getDay()];
  let m = months[date.getMonth() - 1];
  let dayText = (n + " " + m + " " + date.getDate()).toString();
  dayFront.text = dayText;
  dayBack.text = dayText;
}

function updateActivity() {
  console.log("updateActivity");
  stepNum.text = today.adjusted.steps;
  calNum.text = today.adjusted.calories;
  hrm.start();
}

charger.onchange = function(evt) { // TODO
  // console.log('charger.onchange---');
  // console.log(evt);
}

function updateBattery() {
  console.log("updateBattery");
  console.log(btIcon.href);
  // return;
  if (charger.connected) {  
    btIcon.href = "images/b/bc.png";
    btIcon.style.fill = "green";
  } else {
    console.log("charge Level: " + battery.chargeLevel);
    let cl = battery.chargeLevel
    if (cl < 25) {
      btIcon.href = "images/b/b4g.png";
      btIcon.style.fill = "red";
    } else if (cl < 50) {
      btIcon.href = "images/b/b3g.png";
      btIcon.style.fill = "orange";
    } else if (cl < 75) {
      btIcon.href = "images/b/b2g.png";
      btIcon.style.fill = "yellow";
    } else {
      btIcon.href = "images/b/b1g.png";
      btIcon.style.fill = "green";
    }
  }
}

let imgDom = document.getElementById("myImage");
inbox.onnewfile = function () {
  var fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      console.log("image set to " + fileName);
      imgDom.href = "/private/data/" + fileName
    }
  } while (fileName);
};

imgDom.onmousemove = function(evt) {
  console.log("Mouse moved: " + evt.screenX + ' ' + evt.screenY);
}

imgDom.onmousedown = function(evt) {
  console.log("Mouse down: " + evt.screenX + ' ' + evt.screenY);
}

let hrmDom = document.getElementById("hr-num");
let hrm = new HeartRateSensor();
let lastReading = 0;
hrm.onreading = function() {
  console.log("hrm onreading");
  let heartRate;
  if (hrm.timestamp === lastReading) {
    // timestamp has not updated, reading is stale
    heartRate = "--";
  } else {
    heartRate = hrm.heartRate;
  }
  hrmDom.text = heartRate;
  console.log("Current heart rate: " + heartRate);
  lastReading = hrm.timestamp;
  hrm.stop();
}

function processWeatherData(data) {
  console.log("The temperature is: " + data.temperature);
}

function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: 'weather'
    });
  }
}

messaging.peerSocket.onopen = function() {
  console.log("-----peerSocket.onopen");
  updateBattery();
  updateDay(new Date());
  updateActivity();
  hrm.start();
  updateBgImage();
}

messaging.peerSocket.onerror = function(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
}

let sendCounter = 0
function updateBgImage() {
  console.log("updateBgImage");
  var data = {
    counter: sendCounter
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("messaging is ready");
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
    sendCounter += 1
  } else{
    console.log("messaging is not ready");
  }
}
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log("app onmessage");
  // console.log(JSON.stringify(evt.data));
}


setInterval(updateBgImage, 15 * 1000 * 60); // every 15 mins
setInterval(updateActivity, 1 * 1000 * 10); // every 10 sec
// setInterval(hrm.start, 1 * 1000 * 60); // every 1 min
