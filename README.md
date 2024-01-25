
# 1.Named: Water Hype ( Fast hydration process )
@___@ I dont know why i named that lol
Extendsion : water / waterx
Css support : Yes
Typescript : No
Autocomplete : No
Language: [[The Water language]]

# 2. Process
## 1.[[Hydration process]] (Server_side)
## 2.[[Poppulating process]] (Server_side)
## 3.[[Caching]] (Server_side)
## 4.[[Repopulating]] (Client_side)

---

# 1. Precaching every element (May make the side unresponeable when developing)
- Caching using RAM (Variable)
- Caching using file (Cache file)
- _Caching using database :>>_
```javascript
var prebuildHTML = {}

var prebuildJS = {}
```

# 2.Client side caching (this was hard bro)
#hard 

## Client side caching using service worker api was such a hardcore and nightmare for me bruh

The code belike
worker.js:
```javascript
const Cacheing_Html = async () => {
    console.log("Wait")
    const cache = await caches.open("v1");
    console.log(link)
    const response = await fetch(`/html/${link}`);
    const data = await response.json();
    console.log(data)
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
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    var parts = url.split("/"); // split the URL by /
    var lastPart;
    if (parts.length === 2) { // check if the array has only one element
        lastPart = "index"; // return the string "index" as the last part
    } else {
        lastPart = parts.pop(); // get the last element of the array
        if (lastPart === "") { // check if the last element is empty
            lastPart = parts.pop(); // pop again to get the previous element
        }
    }
    console.log(lastPart); // index
    if (lastPart == "index" || lastPart == link) {
      event.respondWith(caches.open("v1").then((cache) => {
        return cacheFirst(event.request.url);
      }));
    } else {
    }
});
```

---
# 1.Recomplie waterx file to javascript and HTML
#hard
### 1. <span style="color:red;">[DEPRICATE]</span> <span style="text-decoration-line: line-through;">Divided two of those using</span> -----
_yeah I dont know why I using -----_
```javascript
var javascriptPart = content.split("-----")[0]
var htmlPart = content.split("-----")[1]
```
---
### 2. repopulate component
_Just simple regex matching_
```javascript
var components = htmlPart.match(/=?{\S+?}/gm);
const title_head = title[0].split(":")[1].trim()
```
---
#### 1.Subtask : Adding function or value into props of an element (X)
	Who no what I did
#### 2.Subtask : Rewrote Post / Pre javascript for loading page an make it interactive (X)
#### 3.Subtask : [[Caching]] (X)
### 4. Subtask : Adding css (Today)
List of work todo:
- [x] Thinking about when to send it (_Hmm_) ✅ 2024-01-25
- [x] When to populate in client to aim for best performance ✅ 2024-01-25
- [x] Remove the heck ----- ✅ 2024-01-25
- [ ] Write Css
---
### 5. Task that I dont know why I did:>
- [x] Adding title metadata ✅ 2024-01-25 #normal 
- [x] Adding javascript function inline ✅ 2024-01-25 #normal 
- [x] Cached (The hardest thing todo) ✅ 2024-01-25 #hard 

---

#hard 
# 1.A process to convert the hydration html / javascript to minimal javascript / compressed html
## _Not yet implented_


---

#normal
# Client side population process

- Damn it easy as this:
```javascript
	function hydrate(filename_or_path) {
	
		const data = complie(parse("index.waterx"), "index.waterx")
	
		// if(!prebuildHTML["index.langx"]) {
	
		prebuildHTML["index.waterx"] = data[0]
	
		prebuildJS["index.waterx"] = data[1]
	
		// }
	
		const js = data[2]
	
	  
	
		return js
	
	}
```

# Will me more

---

# 1. Basic syntax
## Using ----- at a separator for javascript and html (Removed)
```javascript
function Increase() {

    a++;

}
```
```html
<div>

    <h1>{a}</h1>

    <button onClick={Increase}>Click me</button>

</div>
```

All the variable which appear in the HTML code as {} Will be populate into span tag
# 2. Special Keyword
_Added soon_