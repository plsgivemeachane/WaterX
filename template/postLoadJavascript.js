fetch(`/js/${filename}`)
  .then((res) => res.json())
  .then(async (data) => {
    while (prefetch == 0) {
      await new Promise((r) => setTimeout(r, 100));
    }

    var scriptElement = document.createElement("script");
    scriptElement.onload = function () {
      console.log("script loaded")
    };
    scriptElement.onerror = function (error) {
      console.error("Script load error:", error);
    };

    const url = URL.createObjectURL(new Blob([data.js]));
    scriptElement.src = url;
    document.body.appendChild(scriptElement);
    document.getElementById("load").style.display = "none";
});