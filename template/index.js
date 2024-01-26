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

app.get("/", (req, res) => {
  res.send(hydrate("index"));
});

app.get("/:id", (req, res) => {
  const id = req.params.id;
  // Check if the file exists
  if (!fs.existsSync("app/" + id + ".waterx")) {
    res.status(404).send("File not found");
    return;
  }
  res.send(hydrate(id));
});

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

app.listen(3000, () => {
  console.log(chalk.green("\t\t ○ Development link:http://localhost:3000 ○"));
});
