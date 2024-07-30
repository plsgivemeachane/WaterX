fetch(`/js/${filename}`)
  .then((res) => res.text())
  .then(async (data) => {
    document.getElementById("load").style.display = "none";
    while (prefetch == 0) {
      await new Promise((r) => setTimeout(r, 100));
    }

    var scriptElement = document.createElement("script");

    script = data
    const startIndex = script.indexOf('// webpackBootstrap');
    const endIndex = script.lastIndexOf('/******/ ');

    const cutScript = script.substring(startIndex, endIndex + '/******/'.length);

    // console.log(cutScript);

    scriptElement.innerHTML = cutScript;

    document.body.appendChild(scriptElement);

});