/* initGeetest 1.0.0
 * 用于加载id对应的验证码库，并支持宕机模式
 * 暴露 initGeetest 进行验证码的初始化
 * 一般不需要用户进行修改
 * auth: 极验(第三方服务商)
 */
const isNumber = function (value: any): boolean {
  return (typeof value === 'number');
};
const isString = function (value: any): boolean {
  return (typeof value === 'string');
};
const isBoolean = function (value: any): boolean {
  return (typeof value === 'boolean');
};
const isObject = function (value: any): boolean {
  return (typeof value === 'object' && value !== null);
};
const isFunction = function (value: any): boolean {
  return (typeof value === 'function');
};
const random =  () => {
  return parseInt(Math.random() * 10000 + '') + (new Date()).valueOf();
};
const loadScript = (url: string, cb: (b: boolean) => void) => {
  var document = window.document;
  var head = document.getElementsByTagName("head")[0];
  var script: any = document.createElement("script");
  script.charset = "UTF-8";
  script.async = true;
  script.onerror = function () {
      cb(true);
  };
  var loaded = false;
  script.onload = script.onreadystatechange = function () {
      if (!loaded &&
          (!script.readyState ||
          "loaded" === script.readyState ||
          "complete" === script.readyState)) {

          loaded = true;
          setTimeout(function () {
              cb(false);
          }, 0);
      }
  };
  script.src = url;
  head.appendChild(script);
};
const normalizeDomain = function (domain: string) {
  return domain.replace(/^https?:\/\/|\/$/g, '');
};
const normalizePath = function (path: string) {
  path = path.replace(/\/+/g, '/');
  if (path.indexOf('/') !== 0) {
      path = '/' + path;
  }
  return path;
};
const normalizeQuery = function (query: string) {
  if (!query) {
      return '';
  }
  var q = '?';
  new _Object(query)._each(function (key, value) {
      if (isString(value) || isNumber(value) || isBoolean(value)) {
          q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
      }
  });
  if (q === '?') {
      q = '';
  }
  return q.replace(/&$/, '');
};
const makeURL = function (protocol: string, domain: string, path: string, query: string) {
  domain = normalizeDomain(domain);

  var url = normalizePath(path) + normalizeQuery(query);
  if (domain) {
      url = protocol + domain + url;
  }

  return url;
};
const load = (
  protocol: string,
  domains: string[],
  path: string,
  query: any,
  cb: (b: boolean) => void
) => {
  var tryRequest = function (at: number) {
      var url = makeURL(protocol, domains[at], path, query);
      loadScript(url, function (err) {
          if (err) {
              if (at >= domains.length - 1) {
                  cb(true);
              } else {
                  tryRequest(at + 1);
              }
          } else {
              cb(false);
          }
      });
  };
  tryRequest(0);
};
const jsonp = (
  domains: string[],
  path: string,
  config: IConfig,
  callback: (b: any) => void
) => {
  if (isObject(config.getLib)) {
      config._extend(config.getLib);
      callback(config);
      return;
  }
  if (config.offline) {
      callback(config._get_fallback_config());
      return;
  }
  var cb = "geetest_" + random();
  // @ts-ignore
  window[cb] = (data) => {
      if (data.status === 'success') {
          callback(data.data);
      } else if (!data.status) {
          callback(data);
      } else {
          callback(config._get_fallback_config());
      }
      // @ts-ignore
      window[cb] = undefined;
      try {
          // @ts-ignore
          delete window[cb];
      } catch (e) {
      }
  };
  load(config.protocol, domains, path, {
      gt: config.gt,
      callback: cb
  }, function (err) {
      if (err) {
          callback(config._get_fallback_config());
      }
  });
};
const throwError = function (errorType: string, config: any) {
  var errors: any = {
      networkError: '网络错误'
  };
  if (typeof config.onError === 'function') {
      config.onError(errors[errorType]);
  } else {
      throw new Error(errors[errorType]);
  }
};
const detect = function () {
  // @ts-ignore
  return !!window.Geetest;
};

class _Object {
  private _obj:any;
  constructor(obj: any) {
      this._obj = obj
  }

  _each(process: (key: string, value: any) => void): _Object {
      var _obj = this._obj;
      for (var k in _obj) {
          if (_obj.hasOwnProperty(k)) {
              process(k, _obj[k]);
          }
      }
      return this;
  }
}

type ConfigType =  'slide' | 'fullpage';
type Product = 'bind' | 'float' | 'embed' | 'popup';

interface IConfig {
  type: ConfigType;
  protocol: string;
  product?: Product;
  gt?: any;
  challenge?: any;
  new_captcha?: boolean;
  https?: boolean;
  offline?: boolean;
  getLib?: any;
  path?: string;
  static_servers?: string[];
  domains?: string[];

  _get_fallback_config: () => any

  _extend: (obj: any) => void;
}

interface FallbackConfig {
  static_servers: string[];
  type: ConfigType;
  slide: string;
  fullpage: string;
  domains?: string[];
  path?: string;
}

class Config implements IConfig {
  type: ConfigType = 'slide';
  new_captcha = false;
  api_server = 'api.geetest.com';
  protocol = 'http://';
  type_path = '/gettype.php';
  fallback_config = {
      slide: {
          static_servers: ["static.geetest.com", "dn-staticdown.qbox.me"],
          type: 'slide',
          slide: '/static/js/geetest.0.0.0.js'
      },
      fullpage: {
          static_servers: ["static.geetest.com", "dn-staticdown.qbox.me"],
          type: 'fullpage',
          fullpage: '/static/js/fullpage.0.0.0.js'
      }
  };

  constructor(config: any) {
      new _Object(config)._each((key: string, value) => {
          // @ts-ignore
          this[key] = value;
      });
  }

  _get_fallback_config() {
      if (isString(this.type)) {
          return this.fallback_config[this.type];
      } else if (this.new_captcha) {
          return this.fallback_config.fullpage;
      } else {
          return this.fallback_config.slide;
      }
  }

  _extend(obj: any) {
      new _Object(obj)._each((key, value) => {
          // @ts-ignore
          this[key] = value;
      })
  }
}

export const initGeetest = (userConfig: any, callback: (b: any) => void) => {
  var callbacks: any = {};
  var status: any = {};

  if (detect()) {
      status.slide = "loaded";
  }
  var config: any = new Config(userConfig);
  if (userConfig.https) {
      config.protocol = 'https://';
  } else if (!userConfig.protocol) {
      config.protocol = window.location.protocol + '//';
  }
  jsonp([config.api_server || config.apiserver], config.type_path, config, (newConfig: FallbackConfig) => {
      var type = newConfig.type;
      var init = function () {
          config._extend(newConfig);
          // @ts-ignore
          callback(new window.Geetest(config));
      };
      callbacks[type] = callbacks[type] || [];
      var s = status[type] || 'init';
      if (s === 'init') {
          status[type] = 'loading';
          callbacks[type].push(init);
          // @ts-ignore
          load(config.protocol, newConfig.static_servers || newConfig.domains, newConfig[type] || newConfig.path, null, function (err) {
              if (err) {
                  status[type] = 'fail';
                  throwError('networkError', config);
              } else {
                  status[type] = 'loaded';
                  var cbs = callbacks[type];
                  for (var i = 0, len = cbs.length; i < len; i = i + 1) {
                      var cb = cbs[i];
                      if (isFunction(cb)) {
                          cb();
                      }
                  }
                  callbacks[type] = [];
              }
          });
      } else if (s === "loaded") {
          init();
      } else if (s === "fail") {
          throwError('networkError', config);
      } else if (s === "loading") {
          callbacks[type].push(init);
      }
  });
}

