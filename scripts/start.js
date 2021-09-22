"use strict";

console.log("running");
//resource allocation enviorment variables, to decide proceed direction
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

process.on("unhandledRejection", err => {
  throw err;
});

require("../config/env");

const fs = require("fs");
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServe = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;
console.log('running');
//在这里检查src文件下的index.js和public文件下的index.html
if(!checkRequiredFiles([paths.appHtml, paths.appIndexJs])){
  console.log("existsing");
  process.exit(1);
}
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
console.log("DEFAULT_PORT", DEFAULT_PORT);
const HOST = process.env.HOST || '0.0.0.0';
if(process.env.HOST){
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`
  );
  console.log();
}

console.log('running2');

const { checkBrowsers } = require('react-dev-utils/browsersHelper');

console.log('running3', paths.appPath, isInteractive);

checkBrowsers(paths.appPath, isInteractive)
  .then(() => {

    console.log('running4', 3000);

    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {

    console.log('running5', port);

    if(port == null){
      return
    }

    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    const devSocket = {
      warnings: warnings =>
        devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: errors => 
        devServer.sockWrite(devServer.sockets, 'errors', errors),
    };
    const compiler = createCompiler({
      appName,
      config,
      devSocket,
      urls,
      useYarn,
      useTypeScript,
      tscCompileOnError,
      webpack
    });
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath,
    );

    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );

    const devServer = new WebpackDevServe(compiler, serverConfig);
    devServer.listen(port, HOST, err => {
      if(err){
        return console.log(12, err);
      }
      if(isInteractive){
        clearConsole();
      }

      if(process.env.NODE_PATH){
        console.log(
          chalk.yellow(
            'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
          )
        );
        console.log();
      }
      console.log(chalk.cyan('starting tthe development server... \n'));
      openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function(){
        devServer.close();
        process.exit(1);
      });
    });

    if(isInteractive || process.env.CI !== 'true'){
      process.stdin.on('end', function() {
        devServer.close();
        process.exit();
      });
      process.stdin.resume();
    }
  })
  .cath(err => {
    console.log('error213', err);
    if(err && err.message){
      console.log(err.message);
    }
    process.exit();
  });
