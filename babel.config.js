module.exports = {
  // presets: [
  //   '@babel/preset-env',
  //   '@babel/preset-react',
  //   ['@babel/preset-typescript']
  // ],
  // plugin: [
  //   "babel-plugin-transform-typescript-metadata",
  //   ["@babel/plugin-proposal-decorators", {"legacy": true}],
  //   ["@babel/plugin-proposal-class-properties", {"loose": true}],
  //   ["@babel/plugin-transform-typescript", {"allowNamespaces": true}],
  //   ["@babel/plugin-transform-runtime"]
  // ]
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    ['@babel/preset-typescript']
  ],
  plugins: [
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],
    ["@babel/plugin-transform-typescript", { "allowNamespaces": true }],
    ['@babel/plugin-transform-runtime']
  ]
}