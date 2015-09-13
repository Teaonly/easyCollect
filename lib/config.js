appConfig = {
  listenPort: 8080,
  pathName : 'http://127.0.0.1:8080'
};

var weiboConfig = {
  app_key:        '2397998751',
  app_secret:     '64b455ef91873647b9d2452b1aaa27e5',
  accept_url:     'http://127.0.0.1:8080/_/oauth_accept',
  cancel_url:     'http://127.0.0.1:8080/_/oauth_reject'
};

var config = {
  'app' : appConfig,

  'source': {
    'weibo':  weiboConfig,
  },
};

module.exports = config;
