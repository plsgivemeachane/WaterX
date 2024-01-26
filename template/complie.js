const chalk = require("chalk");
const fs = require("fs");
var prebuildHTML = {};
var prebuildJS = {};
var prebuildRunScript = {};
var devMode = false;

function enableDevMode() {
  // console.log("RUNNING IN DEVELOPMENT MODE [CACHE WILL BE DISABLE]")
  devMode = true;
}

function parse(filename) {
  return fs.readFileSync(filename).toString();
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
  var map_comp = {};
  var map_mult = {};
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
  if (title) title_head = title[0].split(":")[1].trim();
  // Finding the {} with consist with a varible inside and make a span tag
  var components = htmlPart.match(/=?{\S+?}/gm);
  var prejavascript = "";
//   console.log(components);
  if (components) {
    for (var comp of components) {
      if (comp.includes("=")) continue;
      map_comp[comp] = id_gen();
      htmlPart = htmlPart.replace(comp, `<span id="${map_comp[comp]}"></span>`);
      const varibleName = comp.replace("{", "").replace("}", "");
      prejavascript += `if(__pre__${varibleName} != ${varibleName}) {document.getElementById("${map_comp[comp]}").innerHTML = ${varibleName};}`;
      // map_mult[varibleName]++;
    }

    for (var comp of components) {
      // Dont populate components if components contain "=" (A probs content)
      // if(comp.includes("=")) continue
      const varibleName = comp.replace("{", "").replace("}", "");
      if (varibleName.includes("=")) continue;
      if (!map_mult[varibleName]) {
        javascriptPart += `\nvar __pre__${varibleName} = undefined;\n`;
        prejavascript += `__pre__${varibleName} = ${varibleName};`;
        map_mult[varibleName] = 1;
      } else {
        // javascriptPart += `\nvar __pre__${varibleName}_${map_mult[varibleName]} = undefined;\n`;
      }
    }

    // Populate probs component
    for (var comp of components) {
      if (!comp.includes("=")) continue;
      const varibleName = comp
        .replace("{", "")
        .replace("}", "")
        .replace("=", "");
      htmlPart = htmlPart.replace(comp.replace("=", ""), `${varibleName}()`); // Mostly function so idk
      // console.log(htmlPart)
      // TODO: Lol we need to make it work
    }
  }

  var postjavascript = `setInterval(() => {${prejavascript}}, 10);\n`;
  var workerScript = fs.readFileSync("workerInit.js").toString();
  var full_package =
    javascriptPart + "\n//Post script\n" + postjavascript + "\n" + workerScript;
  var postLoadHTML = fs.readFileSync("PostLoadHTML.js").toString().replace(
    "${filename}", filename
  );
  var postLoadJavascript = fs.readFileSync("PostLoadJavascript.js").toString().replace(
    "${filename}", filename
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
  // console.log(example_html)
  return [htmlPart, full_package, LoadingHTML];
}

function hydrate(filename_or_path) {
  if((!prebuildHTML["index.langx"] && !fs.existsSync(`/static/${filename_or_path}.html`)) || devMode) {
    console.time("Complie")
    const data = complie(
      parse(filename_or_path + ".waterx"),
      filename_or_path + ".waterx"
    );
    console.timeEnd("Complie")



    // In Ram complier
    prebuildHTML[filename_or_path + ".waterx"] = data[0];
    prebuildJS[filename_or_path + ".waterx"] = data[1];
    prebuildRunScript[filename_or_path + ".waterx"] = data[2];


    // file type compiler
    // Create directory static if not found
    if(!fs.existsSync("static")) {
      fs.mkdirSync("static");
    }

    fs.writeFileSync("static/" + filename_or_path + ".html", data[0]);
    fs.writeFileSync("static/" + filename_or_path + ".js", data[1]);
    fs.writeFileSync("static/" + filename_or_path + "-pre.html", data[2]);
    // fs.writeFileSync("static/" + filename_or_path + ".js", data[2]);

    return data[2];
  } else {
    console.log(chalk.green("Using cache content"))
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
  if(!prebuildJS[filename]) {
    if(!fs.existsSync("static/" + filename.split(".")[0] + ".js")) {
      console.log(chalk.red("Error file not complied JS: static/" + filename.split(".")[0] + ".js"));
      return "Error file not complied";
    }

    prebuildJS[filename] = fs.readFileSync("static/" + filename.split(".")[0] + ".js").toString();
  }
  
  return prebuildJS[filename];
};

module.exports = {
  parse,
  complie,
  hydrate,
  getPrebuildHTML,
  getPrebuildJS,
  enableDevMode
};