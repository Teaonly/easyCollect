appConfig = {
  listenPort: 8080,
};

var weiboConfig = {
  app_key:        '2397998751',
  app_secret:     '64b455ef91873647b9d2452b1aaa27e5',
  accept_url:     'http://127.0.0.1:8080/_/access',
  cancel_url:     'http://127.0.0.1:8080/_/quit'
};



var config = {
  'app' : appConfig,

  'import': {
    'weibo':  weiboConfig,
  },
};

module.exports = config;

