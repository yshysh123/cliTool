"use strict";
const { exec, execSync } = require("child_process");
const co = require("co");
const prompt = require("co-prompt");
const config = require("../templates");
const chalk = require("chalk");
const inquirer = require("inquirer");

module.exports = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "tmplName",
        message: "Please select a project template:",
        choices: ["vue-vuex-scaffold", "react-mobx-scaffold", "other"]
      }
    ])
    .then(answers => {
      co(function*() {
        // 处理用户输入
        let tplName = answers.tmplName;
        if (answers.tmplName === "other") {
          tplName = yield prompt("Template Name: ");
        }
        let projectName = yield prompt("Project name: ");
        let gitUrl;
        let branch;
        if (!config.tpl[tplName]) {
          console.log(chalk.red("\n × Template does not exit!"));
          process.exit();
        }

        gitUrl = config.tpl[tplName].url;
        branch = config.tpl[tplName].branch;

        // git命令，远程拉取项目并自定义项目名
        let cmdStr = `git clone ${gitUrl} ${projectName} && cd ${projectName} && git checkout ${branch}`;

        const needInstall =
          (yield prompt("Do you want to npm install ? (Y/N)"))
            .trim()
            .toLowerCase() === "y";

        exec(cmdStr, (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            process.exit();
          }
          if (!needInstall) {
            console.log(chalk.green("\n √ Create completed!"));
            process.exit();
          } else {
            execSync(`cd ${projectName} && npm install`, { stdio: [0, 1, 2] });
          }
          console.log(chalk.green("\n √ Generation completed!"));
          process.exit();
        });
      });
    });
};
