import { outbox } from "file-transfer"
import * as messaging from "messaging";


function fetchImage(srcImage, destFilename) {
  console.log("at fetchImage");
  // Fetch the image from the internet
  fetch(srcImage).then(function (response) {
    // We need an arrayBuffer of the file contents
    return response.arrayBuffer();
  }).then(function (data) {
    // Queue the file for transfer
    outbox.enqueue(destFilename, data).then(function (ft) {
      // Queued successfully
      // console.log("Transfer of '" + destFilename + "' successfully queued.");
    }).catch(function (error) {
      // Failed to queue
      throw new Error("Failed to queue '" + destFilename + "'. Error: " + error);
    });
  }).catch(function (error) {
    // Log the error
    console.log("Failure: " + error);
  });
}

messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  console.log("[companion] onopen");
}

messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  // console.log(JSON.stringify(evt.data));
  let imgHref = "https://source.unsplash.com/random/100x100"
  let dstFileName = new Date().getTime() + "img.jpg"; // need to change filename for fresh rendering
  // console.log("call fetchImage");
  fetchImage(imgHref, dstFileName);
}

messaging.peerSocket.onerror = function(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
}
