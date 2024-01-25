fetch("/js/${filename}")
  .then((res) => res.json())
  .then(async (data) => {
    while (prefetch == 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
    // document.body.innerHTML += data.js
    var scriptElement = document.createElement("script");
    scriptElement.innerHTML = data.js;
    document.body.appendChild(scriptElement);
    document.getElementById("load").style.display = "none";
  });
