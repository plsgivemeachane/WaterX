fetch(`/js/${filename}`)
  .then((res) => res.json())
  .then(async (data) => {
    document.getElementById("load").style.display = "none";
    while (prefetch == 0) {
      await new Promise((r) => setTimeout(r, 100));
    }

    var scriptElement = document.createElement("script");
    // scriptElement.onload = function () {
    //   console.log("script loaded")
    //   // eval(cutScript);
    // };
    // scriptElement.onerror = function (error) {
    //   console.error("Script load error:", error);
    // };

    // const url = URL.createObjectURL(new Blob([data.js]));
    // scriptElement.src = url

    script = data.js
    const startIndex = script.indexOf('// webpackBootstrap');
    const endIndex = script.lastIndexOf('/******/ ');

    const cutScript = script.substring(startIndex, endIndex + '/******/'.length);
    scriptElement.innerHTML = cutScript;

    // console.log(cutScript);
    document.body.appendChild(scriptElement);

});