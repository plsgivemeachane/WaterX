const express = require("express");
const fs = require("fs");
const {
  getPrebuildHTML,
  getPrebuildJS,
  hydrate,
  enableDevMode,
  buildStatic,
} = require("./complie");

const chalk = require ("chalk")
const commandLineArgs = process.argv.slice(2);
if(commandLineArgs[0] == "--dev") {
  console.log(chalk.blue("\t\t ○ Running in development mode ○\n"))
  enableDevMode()
} else if(commandLineArgs[0] == "--build") {
  console.log(chalk.blue("\t\t ○ Building static files... ○\n"))
  enableDevMode()
  const buildtime = async() => {
    await buildStatic()

    console.log(chalk.blue("\t\t ○ Building Complete Successfully ○\n"))

    process.exit(0);
  }
  buildtime()
} else {
  console.log(chalk.blue("\t\t ○ Running in production mode ○\n"))
  console.log(chalk.blue("\t\t ○ Building static files... ○\n"))

  buildStatic()
}

const app = express();
// Get the command line arguments

app.use(express.static("public"));
app.use(express.static("static"));

app.get("/", async (req, res) => {
  res.send(await hydrate("index", "app"));
});

app.get(/.+/, async (req, res, next) => {
  if(req.url.includes("html") || req.url.includes("js") || req.url.includes("css")) {
    next();

    return;
  }

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

// app.get("/html/:id", (req, res) => {
//   res.send({
//     html: getPrebuildHTML(req.params.id),
//   });
// });

// app.get("/js/:id", (req, res) => {
//   res.send({
//     js: getPrebuildJS(req.params.id),
//   });
// });

app.get(/.*\.css/, (req, res) => {
  const path = req.url.split("/").slice(0, -1).join("/");
  const file = req.url.split("/").slice(-1)[0];
  res.sendFile(__dirname + "/app/" + path + "/" + file);
})

app.listen(3000, () => {
  console.log(chalk.green("\t\t ○ Development link:http://localhost:3000 ○"));
});
