/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var chalk = require('chalk');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var opn = require('opn');

// https://github.com/sindresorhus/opn#app
var OSX_CHROME = 'google chrome';

const Actions = Object.freeze({
  NONE: 0,
  BROWSER: 1,
  SCRIPT: 2,
});

function getBrowserEnv() {
  
  // 应用设置了BROWSER环境变量来指定浏览器，否则使用默认动作 
  const value = process.env.BROWSER;
  let action;
  if (!value) {
    // Default.
    action = Actions.BROWSER;
  } else if (value.toLowerCase().endsWith('.js')) {
    action = Actions.SCRIPT;
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE;
  } else {
    action = Actions.BROWSER;
  }

  // action表示打开浏览器还是执行JS脚本。
  return { action, value };
}


// 执行node脚本
function executeNodeScript(scriptPath, url) {
  const extraArgs = process.argv.slice(2);
  const child = spawn('node', [scriptPath, ...extraArgs, url], {
    stdio: 'inherit',
  });
  child.on('close', code => {
    if (code !== 0) {
      console.log();
      console.log(
        chalk.red(
          'The script specified as BROWSER environment variable failed.'
        )
      );
      console.log(chalk.cyan(scriptPath) + ' exited with code ' + code + '.');
      console.log();
      return;
    }
  });
  return true;
}



function startBrowserProcess(browser, url) {
 
  // 在mac环境下，默认启动chrome浏览器
  const shouldTryOpenChromeWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === OSX_CHROME);

    // 在mac环境下
  if (shouldTryOpenChromeWithAppleScript) {
    try {
      
      execSync('ps cax | grep "Google Chrome"');
      execSync('osascript openChrome.applescript "' + encodeURI(url) + '"', {
        cwd: __dirname,
        stdio: 'ignore',
      });
      return true;
    } catch (err) {
      // Ignore errors.
    }
  }

 // 检查Mac环境下，browser环境变量是否已经变为open，如果为open则说明该浏览器已经打开不需要再次打开窗口
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined;
  }

//  跨平台打开某个应用
  try {
    var options = { app: browser };
    opn(url, options).catch(() => {}); // Prevent `unhandledRejection` error.
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reads the BROWSER evironment variable and decides what to do with it. Returns
 * true if it opened a browser or ran a node.js script, otherwise false.
 */
function openBrowser(url) {
  const { action, value } = getBrowserEnv();
  switch (action) {
    case Actions.NONE:
      // 不打开浏览器，则直接返回
      return false;
    case Actions.SCRIPT:
      return executeNodeScript(value, url);
    case Actions.BROWSER:
      return startBrowserProcess(value, url);
    default:
      throw new Error('Not implemented.');
  }
}

module.exports = openBrowser;
