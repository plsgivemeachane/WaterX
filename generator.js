#!/usr/bin/env node

import yargs from 'yargs'
import chalk from 'chalk'
import inqurer from 'inquirer'
import { createSpinner } from 'nanospinner';
import fs from 'fs'
// run terminal command
import { exec } from 'child_process';


let project = {};

const commmon_files = [
    "package.json",
    "loading.html",
    "index.js",
    "public/worker.js",
    "public/global.css",
    "complie.js",
    "app/index.waterx",
    "PostLoadHTML.js",
    "postLoadJavascript.js",
    "workerInit.js",

]

const cdn = "https://pub-3d17685d6a884313b28a5105af37d0b1.r2.dev/"

async function main() {
    await askName();
    await create();
}

async function askName() {
    const answers = await inqurer.prompt({
        name: "project name",
        type: "input",
        message: "Project name"
    })

    project.name = answers["project name"]
}

async function create() {
    console.log(chalk.green(`Creating ${project.name}...`))
    const spinner = createSpinner('Creating  nesscessary folder and downloading file ...').start()

    // create project
    fs.mkdirSync(project.name)
    // Create public and app folder
    fs.mkdirSync(project.name + "/public");
    fs.mkdirSync(project.name + "/app");

    for(var file of commmon_files) {
        // log
        // const spinner2 = createSpinner(`Creating ${file}...`).start()
        try {
            // console.log(chalk.green(`Creating ${file}...`))
            // Fetch the file from intenet
            const response = await fetch(cdn + file)
            // console.log(chalk.green(`Downloaded ${file}...`))
            // spinner.success({ text: `Done! ${file}` })
            const code = await response.text()
            fs.writeFileSync(project.name + "/" + file, code)
        } catch (error) {
            spinner2.error({ text: error })
            return
        }
    }
    spinner.success({ text: 'Success!' })

    const spinner2 = createSpinner('Running build').start()
    // run npm install
    exec(`cd ${project.name} && npm install`, (error, stdout, stderr) => {
        if (error) {
            spinner2.error({ text: error })
            return
        } else {
            spinner2.success({ text: 'Success!' })
            console.log(chalk.green(stdout))
            console.log(chalk.blue(`\t\tCreated ${project.name}!`))
            console.log(chalk.blue(`\t\tRun script using npm run dev`))
            console.log(chalk.blue(`\t\tIf you want to deploy it. Just find some server and npm run start`))
        }
    })
}

main()