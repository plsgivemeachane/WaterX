// Function to initialize the inline worker
function initializeInlineWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/worker.js")
      .then((registration) => {
        // Registration was successful
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        // Registration failed
        console.error("Service Worker registration failed:", error);
      });

    navigator.serviceWorker.ready.then((registration) => {
        var url = window.location.href; // example URL without a last part
        var parts = url.split("/"); // split the URL by /
        // remove empty elements
        for(var i = parts.length - 1; i >= 0; i--) {
            if(parts[i] == "") {
                parts.splice(i, 1);
            }
        }
        // console.log(parts)
        var lastPart;
        if (parts.length === 2) { // check if the array has only one element
            lastPart = "index"; // return the string "index" as the last part
        } else {
            lastPart = parts.pop(); // get the last element of the array
            if (lastPart === "") { // check if the last element is empty
                lastPart = parts.pop(); // pop again to get the previous element
            }
        }
        // console.log(lastPart); // index
        registration.active.postMessage(lastPart + ".waterx");
    })
  }
}

// Initialize the inline worker
initializeInlineWorker();
