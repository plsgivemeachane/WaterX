const express = require("express");
const fs = require("fs");
const {
  parse,
  complie,
  getPrebuildHTML,
  getPrebuildJS,
  hydrate,
} = require("./complie");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(hydrate("index"));
});

app.get("/:id", (req, res) => {
  const id = req.params.id;
  // Check if the file exists
  if (!fs.existsSync(id + ".waterx")) {
    res.status(404).send("File not found");
    return;
  }
  res.send(hydrate(id));
});

app.get("/html/:id", (req, res) => {
  res.send({
    html: getPrebuildHTML()[req.params.id],
  });
});

app.get("/js/:id", (req, res) => {
  res.send({
    js: getPrebuildJS()[req.params.id],
  });
});

app.get("/css/:id", (req, res) => {
  res.send({
    css: fs.readFileSync(id + ".css"),
  });
});

app.listen(3000, () => {
  console.log("App started at http://localhost:3000");
});
