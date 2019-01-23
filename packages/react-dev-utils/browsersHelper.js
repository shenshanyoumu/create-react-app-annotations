/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const browserslist = require('browserslist');
const chalk = require('chalk');
const os = require('os');

// 交互式命令行模块
const inquirer = require('inquirer');
const pkgUp = require('pkg-up');
const fs = require('fs');

const defaultBrowsers = [
  '>0.2%',
  'not dead',
  'not ie <= 11',
  'not op_mini all',
];

// 交互式命令行确定设置browserlist字段
function shouldSetBrowsers(isInteractive) {
  if (!isInteractive) {
    return Promise.resolve(true);
  }

  const question = {
    type: 'confirm',
    name: 'shouldSetBrowsers',
    message:
      chalk.yellow("We're unable to detect target browsers.") +
      `\n\nWould you like to add the defaults to your ${chalk.bold(
        'package.json'
      )}?`,
    default: true,
  };

  // 默认输出true
  return inquirer.prompt(question).then(answer => answer.shouldSetBrowsers);
}


// 检测样板项目运行的浏览器环境
function checkBrowsers(dir, isInteractive, retry = true) {
  const current = browserslist.findConfig(dir);
  if (current != null) {
    return Promise.resolve(current);
  }


  // 在项目的package.json文件添加browserlist字段，因为不同的浏览器对react特性支持不一样
  if (!retry) {
    return Promise.reject(
      new Error(
        chalk.red(
          'As of react-scripts >=2 you must specify targeted browsers.'
        ) +
          os.EOL +
          `Please add a ${chalk.underline(
            'browserslist'
          )} key to your ${chalk.bold('package.json')}.`
      )
    );
  }

  return shouldSetBrowsers(isInteractive).then(shouldSetBrowsers => {
    if (!shouldSetBrowsers) {
      return checkBrowsers(dir, isInteractive, false);
    }

    return (
      pkgUp(dir)
        .then(filePath => {
          if (filePath == null) {
            return Promise.reject();
          }

          // 在当前工作目录最近的package.json文件下设置browserlist。
          const pkg = JSON.parse(fs.readFileSync(filePath));
          pkg['browserslist'] = defaultBrowsers;
          fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + os.EOL);

          browserslist.clearCaches();
          console.log();
          console.log(
            `${chalk.green('Set target browsers:')} ${chalk.cyan(
              defaultBrowsers.join(', ')
            )}`
          );
          console.log();
        })
        // Swallow any error
        .catch(() => {})
        .then(() => checkBrowsers(dir, isInteractive, false))
    );
  });
}

module.exports = { defaultBrowsers, checkBrowsers };
