#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// node执行脚本出错时，直接抛出异常
process.on('unhandledRejection', err => {
  throw err;
});

// 在create-react-app命令脚手架
const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);

// 在生成的样板项目中支持下面几个脚本命令
const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);

// 默认为build命令
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

switch (script) {
  case 'build':
  case 'eject':
  case 'start':
  case 'test': {

    // 子进程执行Node脚本，并输出控制台
    const result = spawn.sync(
      'node',
      nodeArgs
        .concat(require.resolve('../scripts/' + script))

        // 下面是脚本启动参数列表
        .concat(args.slice(scriptIndex + 1)),
      { stdio: 'inherit' }
    );

    // 该进程接收到外部信号，根据信号类型打印输出并退出进程
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        );
      }
      process.exit(1);
    }

    // 异常的退出
    process.exit(result.status);
    break;
  }

  // 非内置脚本命令，则打印如下信息
  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update react-scripts?');
    console.log(
      'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
    );
    break;
}
