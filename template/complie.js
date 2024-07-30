const chalk = require("chalk");
const fs = require("fs");
const Webpack = require('webpack');
const webpackConfig = require('./webpack.config.js'); // Import configuration
const path = require("path");
const { info } = require("console");
var prebuildHTML = {};
var prebuildJS = {};
var prebuildRunScript = {}
var devMode = false;

function enableDevMode() {
  // console.log("RUNNING IN DEVELOPMENT MODE [CACHE WILL BE DISABLE]")
  devMode = true;
}

function infolog(message) {
  console.log(chalk.blue("\t\t ○ " + message + " ○"));
}

function parse(filename, path) {
  var abs_path = (path ? path + "/" : "") + filename;
  // console.log("parsing: " + abs_path, path)
  var content = fs.readFileSync(abs_path).toString();
  // console.log(content)
  return content;
}

function id_gen() {
  // Generate a 8 chara id
  return Math.floor((1 + Math.random()) * 0x100000000)
    .toString(16)
    .substring(1);
}

function split_content(content) {
  for (var i = 0; i < content.length; i++) {
    // check for the first notice of html such at <
    if (content[i] == "<") {
      return [content.substring(0, i), content.substring(i, content.length)];
    }
  }
}

function complie(content, filename) {
  // console.log(content)
  var map_comp = {};
  var map_mult = {};
  if(content.trim() == "") return
  // complie the langx language with is my new language
  // has 2 part. One is for javascript code and one for html splited by -----
  var contents = split_content(content);
  var javascriptPart = contents[0];
  var htmlPart = contents[1];
  // Trim down leading and trailing spaces
  javascriptPart = javascriptPart.trim();
  // console.log(javascriptPart)
  // console.log(htmlPart)

  /*
        Example html code
        <div>
            <p>{a}</a>
        </div>
    */

  /*
        Populating metadata
    */

  // Match all text for that line
  var title = javascriptPart.match(/Title:.+/g);
  var title_head = "Default";
  if (title) {
    infolog("File contain Title medata: " + title_head);
    title_head = title[0].split(":")[1].trim();
  }
  // Finding the {} with consist with a varible inside and make a span tag
  var components = htmlPart.match(/=?{\S+?}/gm);
  var prejavascript = "";
//   console.log(components);
  infolog("Found " + components.length + " components");
  if (components) {
    for (var comp of components) {
      if (comp.includes("=")) continue;
      map_comp[comp] = id_gen();
      htmlPart = htmlPart.replace(comp, `<span id="${map_comp[comp]}"></span>`);
      const varibleName = comp.replace("{", "").replace("}", "").replace(/\[/g, "__").replace(/\]/g,"__").replace(/\./g, "___");
      const actualVariable = comp.replace("{", "").replace("}", "");
      infolog("--> " + varibleName + " = " + actualVariable + " [ " + map_comp[comp] + " ]");
      prejavascript += `if(__pre__${varibleName} != ${actualVariable}) {document.getElementById("${map_comp[comp]}").innerHTML = ${actualVariable};}`;
    }

    for (var comp of components) {    
      const varibleName = comp.replace("{", "").replace("}", "").replace(/\[/g, "__").replace(/\]/g,"__").replace(/\./g, "___");
      if (varibleName.includes("=")) continue;
      const actualVariable = comp.replace("{", "").replace("}", "");
      if (!map_mult[varibleName]) {
        javascriptPart += `var __pre__${varibleName} = undefined;`;
        prejavascript += `__pre__${varibleName} = ${actualVariable};`;
        map_mult[varibleName] = 1;
      } else {
        // pass
      }
    }

    // Populate probs component (function)
    for (var comp of components) {
      if (!comp.includes("=")) continue;
      const varibleName = comp
        .replace("{", "")
        .replace("}", "")
        .replace("=", "");
      infolog("--> probs :--: " + varibleName);
      htmlPart = htmlPart.replace(comp.replace("=", ""), `${varibleName}()`); // Mostly function so idk
      // console.log(htmlPart)
      // TODO: Lol we need to make it work
    }
  }

  var postjavascript = `var mainInterval = setInterval(() => {
    try{
      ${prejavascript}
    } catch(e) {
      clearInterval(mainInterval)
    }}, 10); // Catch error and clear interval
  `; // Script to update the varible
  var workerScript = fs.readFileSync("workerInit.js").toString(); // Script to init the worker
  var full_package =
    javascriptPart + "\n//Post script\n" + postjavascript + "\n" + workerScript; // Combine all the script
  var postLoadHTML = fs.readFileSync("PostLoadHTML.js").toString().replace(
    "${filename}", filename.split(".")[0] + ".html"
  );
  var postLoadJavascript = fs.readFileSync("PostLoadJavascript.js").toString().replace(
    "${filename}", filename.split(".")[0] + ".js"
  );
  var PostLoadPackage =
    "<script>" + postLoadJavascript + postLoadHTML + "</script>";
  var LoadingHTML = fs.readFileSync("loading.html").toString();

  LoadingHTML = LoadingHTML.replace(
    "${title_head}", title_head
  )

  LoadingHTML = LoadingHTML.replace(
    "${PostLoadPackage}", PostLoadPackage
  )

  infolog("D--> HTML Part Size: " + htmlPart.length + "B");
  infolog("D--> Full Package Size: " + full_package.length + "B");
  infolog("D--> PreHTML Package Size: " + LoadingHTML.length + "B");
  // console.log(example_html)
  return [htmlPart, full_package, LoadingHTML];
}

/**
 * Asynchronously hydrates the given file or path.
 *
 * @param {string} filename_or_path - The name or path of the file to hydrate
 * @param {string} path - The path to the file
 * @return {string} The hydrated data from the file
 */
async function hydrate(filename_or_path, path) {
  // console.log(prebuildHTML[filename_or_path])
  if((!prebuildHTML[filename_or_path + ".waterx"] && !fs.existsSync(`/static/${path}/${filename_or_path}.html`)) || devMode) {
    // filename_or_path = "app/" + filename_or_path;
    console.log(chalk.yellow("\t\t ○ Reqest " + filename_or_path + " compiling"));
    console.time(chalk.green("\t\t ○ Complied " + filename_or_path))
    const data = complie(
      parse(filename_or_path + ".waterx", path),
      filename_or_path + ".waterx"
    );
    console.timeEnd(chalk.green("\t\t ○ Complied " + filename_or_path))

    // console.log(data, filename_or_path)
    if(!data) return

    // In Ram complier
    prebuildHTML[filename_or_path + ".waterx"] = data[0];
    prebuildJS[filename_or_path + ".waterx"] = data[1];
    prebuildRunScript[filename_or_path + ".waterx"] = data[2];


    // file type compiler
    // Create directory static if not found
    if(!fs.existsSync("static")) {
      fs.mkdirSync("static");
    }

    if(!fs.existsSync("static/html")) {
      fs.mkdirSync("static/html");
    }

    if(!fs.existsSync("static/js")) {
      fs.mkdirSync("static/js");
    }


    fs.writeFileSync("static/html/" + filename_or_path + ".html", data[0]);
    fs.writeFileSync("static/" + filename_or_path + ".js", data[1]);
    fs.writeFileSync("static/" + filename_or_path + ".html", data[2]);

    await buildBundle("static/" + filename_or_path + ".js");

    infolog("Complied " + filename_or_path);

    return data[2];
  } else {
    // console.log(chalk.green("Using cache content"))
    console.log(chalk.green("\t\t ○ Reqest /" + path + "/" + filename_or_path + " serve with cache content"));
    if(!prebuildRunScript[filename_or_path + ".waterx"]) {
      return prebuildRunScript[filename_or_path + ".waterx"] = fs.readFileSync("static/" + filename_or_path + "-pre.html").toString();
    } else {
      return prebuildRunScript[filename_or_path + ".waterx"];
    }
  }
}

const getPrebuildHTML = (filename) => {
  if(!prebuildHTML[filename]) {
    if(!fs.existsSync("static/" + filename.split(".")[0] + ".html")) {
      console.log(chalk.red("Error file not complied HTML"));
      return "Error file not complied";
    }

    prebuildHTML[filename] = fs.readFileSync("static/" + filename.split(".")[0] + ".html").toString();
  }

  return prebuildHTML[filename];
};

const getPrebuildJS = (filename) => {
  if(!fs.existsSync("static/" + filename.split(".")[0] + ".js")) {
    console.log(chalk.red("Error file not complied JS: static/" + filename.split(".")[0] + ".js"));
    return "Error file not complied";
  }

  // console.log("dist/static/" + filename.split(".")[0] + ".js.js")
  const file_content = fs.readFileSync("static/" + filename.split(".")[0] + ".js").toString();
  // console.log(file_content)
  return file_content;
};

const travel = async (path = "app")  => {
  for (var file of fs.readdirSync(path)) {
    if (file.endsWith(".waterx")) {
      console.log(chalk.yellow(`\t\t ○ Building file ${path}/${file} ○`))
      await hydrate(file.split(".")[0], path);
      continue
    }

    try {
      if (fs.lstatSync(path + "/" + file).isDirectory()) {
        await travel(path + "/" + file);
      }
    } catch (error) {
      console.log(error)
    }
  }
}

const buildStatic = async () => {
  if(!fs.existsSync("static")) {
    fs.mkdirSync("static");
  }

  // console.log(process.cwd())

  await travel()
}

const extractFilename = (path) => {
  return path.split("/").slice(-1)[0];
}

async function buildBundle(filename) {
  infolog("Building bundle: " + "./" + extractFilename(filename) + " " + path.resolve(__dirname, "static", "js"));
  const compiler = Webpack([
    { entry: "./" + filename, output: { filename:"./" + extractFilename(filename), path: path.resolve(__dirname, "static", "js") }, mode:"production" , optimization: {minimize: false}, performance : {hints : false}},
  ]);

  while(!fs.existsSync(filename)) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  // Compile asynchronously
  try {
    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          reject(err);
        } else {
          const info = stats.toJson();
          // infolog(info)

          if (stats.hasErrors()) {
            console.error(info.errors);
          }

          if (stats.hasWarnings()) {
            console.warn(info.warnings);
          }

          resolve(stats);
        }
      });
    });
  } catch (err) {
    console.error('Webpack build error:', err);
  }
}


module.exports = {
  parse,
  complie,
  hydrate,
  getPrebuildHTML,
  getPrebuildJS,
  enableDevMode,
  buildStatic
};
