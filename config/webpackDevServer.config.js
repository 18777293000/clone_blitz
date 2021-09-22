'use strict';

const fs = require('fs');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('./paths');
const getHttpsConfig = require('./getHttpsConfig');
const gethttpconfig = require('./getHttpsConfig');

const host = process.env.HOST || '0.0.0.0';
console.log(process.env.HOST);

const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_WEBSILUT_PATH;
const sockPort  = process.env.WDS_SOCKET_PORT;

module.exports = function(proxy, allowHost){
  return {
    disableHostCheck:
    !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    contentbasePublicPath: paths.publicUrlOrPath,
    watchContentBase: true,
    hot: true,
    transportMode : 'ws',
    injectClient: false,
    sockHost,
    sockPath,
    sockPort,
    publicPath: paths.publicUrlOrPath.slice(0, -1),
    quiet: true,
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    https: gethttpconfig(),
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    public: allowHost,
    proxy,
    before(app, server){
      app.use(evalSourceMapMiddleware(server));
      app.use(errorOverlayMiddleware());

      if(fs.existsSync(paths.proxySetup)){
        require(paths.proxySetup)(app);
      }
    },
    after(app){
      app.use(redirectServedPath(paths.publicUrlOrPath));
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    },
  }
}