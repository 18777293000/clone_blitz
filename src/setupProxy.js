const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
    '/proxy',
    createProxyMiddleware({
      target: 'https://x.fast-gateway.com/',
      changeOrigin: true,
      pathRewrite: {
        "^/proxy": "",
      }
    })
  );
  app.use(
    '/geoip/country2',
    createProxyMiddleware({
      target: 'https://wapi.hawtfly.co//geoip/country2',
      changeOrigin: true,
      pathRewrite: {
        "^/geoip/country2": ""
      }
    })
  )
}