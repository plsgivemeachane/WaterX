const express = require("express");
const fs = require("fs");
const {
  getPrebuildHTML,
  getPrebuildJS,
  hydrate,
  enableDevMode,
  buildStatic,
} = require("./complie");
const app = express();
const chalk = require ("chalk")
// Get the command line arguments
const commandLineArgs = process.argv.slice(2);
if(commandLineArgs[0] == "--dev") {
  console.log(chalk.blue("\t\t ○ Running in development mode ○\n"))
  enableDevMode()
} else {
  console.log(chalk.blue("\t\t ○ Running in production mode ○\n"))
  console.log(chalk.blue("\t\t ○ Building static files... ○\n"))

  buildStatic()
}

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.send(await hydrate("index", "app"));
});

app.get(/.+/, async (req, res, next) => {
  if(req.url.includes("html") || req.url.includes("js") || req.url.includes("css")) {
    next();

    return;
  }
  // res.send(req.url)
  if (!fs.existsSync("app/" + req.url + ".waterx")) {
    res.status(404).send("File not found");
    return;
  }

  // split out directory
  // Example : /home/user/app/index

  if(req.url.split("/").length > 1) {
    const path = req.url.split("/").slice(0, -1).join("/");
    const file = req.url.split("/").slice(-1)[0];
    res.send(await hydrate(file, "app" + path));

    return;
  }

  res.send(hydrate(req.url, "app"));
})

// app.get("/:id", (req, res) => {
//   const id = req.params.id;
//   // Check if the file exists
//   if (!fs.existsSync("app/" + id + ".waterx")) {
//     res.status(404).send("File not found");
//     return;
//   }
//   res.send(hydrate(id));
// });

app.get("/html/:id", (req, res) => {
  res.send({
    html: getPrebuildHTML(req.params.id),
  });
});

app.get("/js/:id", (req, res) => {
  res.send({
    js: getPrebuildJS(req.params.id),
  });
});

app.get(/.*\.css/, (req, res) => {
  const path = req.url.split("/").slice(0, -1).join("/");
  const file = req.url.split("/").slice(-1)[0];
  res.sendFile(__dirname + "/app/" + path + "/" + file);
})

app.listen(3000, () => {
  console.log(chalk.green("\t\t ○ Development link:http://localhost:3000 ○"));
});
