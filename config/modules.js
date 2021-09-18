'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const chalk = require('react-dev-utils/chalk');
const resolve = require('resolve');

/**
 * 
 * @param {object} options
 */
function getAdditionalModulePaths(options = {}) {
  const baseUrl = options.baseUrl;

  if(baseUrl == null) {
    const nodePath = process.env.NODE_PATH || '';
    return nodePath.split(path.delimiter).filter(Boolean);
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if(path.relative(paths.appNodeModules, baseUrlResolved) === ''){
    return null;
  }

  if(path.relative(paths.appSrc, baseUrlResolved) === ''){
    return [paths.appSrc];
  }

  if(path.relative(paths.appPath, baseUrlResolved) === ''){
    return null;
  }

  throw new Error(
    chalk.red.bold(
      "Your project's `baseUrl` can only be set to `src` or `node_modules`." +
        ' Create React App does not support other values at this time.'
    )
  )
}

/**
 * @param {*} options
 */
function getWebpackAliases(options = {}){
  const baseUrl = options.baseUrl;

  if(!baseUrl){
    return {};
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if(path.relative(paths.appPath, baseUrlResolved) === ''){
    return {
      src: paths.appSrc
    };
  }
}

/**
 * @param {*} options
 */
function getJestAliases(options = {}){
  
}