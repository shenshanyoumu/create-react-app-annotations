/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const create = require('./create');

// 在react-scripts包中，会安装babel-preset-react-app模块
module.exports = function(api, opts) {
//  基于不同的开发环境
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  return create(api, opts, env);
};
