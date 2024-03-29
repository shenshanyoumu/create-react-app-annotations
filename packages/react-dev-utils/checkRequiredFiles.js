/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// 检查指定路径下的文件是否存在
function checkRequiredFiles(files) {
  var currentFilePath;
  try {
    files.forEach(filePath => {
      currentFilePath = filePath;

      // 访问文件是否存在
      fs.accessSync(filePath, fs.F_OK);
    });
    return true;
  } catch (err) {

    // 如果不存在，则输出错误信息
    var dirName = path.dirname(currentFilePath);
    var fileName = path.basename(currentFilePath);
    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
    console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
    return false;
  }
}

module.exports = checkRequiredFiles;
