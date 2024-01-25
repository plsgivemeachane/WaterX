var link = ""

self.addEventListener("message", (event) => {
    // console.log("HERE")
    link = event.data
    Cacheing_Html()
})

const Cacheing_Html = async () => {
    // console.log("Wait")
    // while (link == "") {
    //     await new Promise((r) => setTimeout(r, 100));
    // }
    // console.log("Recived")
    const cache = await caches.open("v1");
    // Html
    // console.log(link)
    const response = await fetch(`/html/${link}`);
    const data = await response.json();
    // console.log(data)
    // cache.put(`/html/${link}`, new Response(data.html));
    if(link == "index") {
        cache.put(`/`, new Response(data.html));
        cache.put(`/html/${link}`, new Response(JSON.stringify(data)));
    } else {
        cache.put(`/${link}`, new Response(data.html));
        cache.put(`/html/${link}`, new Response(JSON.stringify(data)));
    }

    const response2 = await fetch(`/js/${link}`);
    const data2 = await response2.json();
    cache.put(`/js/${link}`, new Response(JSON.stringify(data2)));
}
  

self.addEventListener("install", (event) => {
});

// Fetch the HTML content
self.addEventListener('fetch', (event) => {
    // Is this one of our precached assets?
    const url = event.request.url;
    // var url = "http://localhost:3000"; // example URL without a last part
    var parts = url.split("/"); // split the URL by /
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
    if (lastPart == "index" || lastPart == link) {
      // Grab the precached asset from the cache
      event.respondWith(caches.open("v1").then((cache) => {
        return cacheFirst(event.request.url);
      }));
    } else {
      
    }
});

const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        // console.log("Has " + request + " In cache")
      return responseFromCache;
    }
    return await fetch(request);
  };
  
