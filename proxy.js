var http = require('http'),
    httpProxy = require('http-proxy');

var re = /^\/\-\/((\w+)\-(.+)\.tgz)$/;

httpProxy.createServer(function (req, res, proxy) {
  var match, path, h;
  if (match = re.exec(req.url)) {
    path = '/registry/' + match[2] + '/' + match[1];
    console.log(req.url + ' -> ' + path);
    var h = http.get({
      host: 'isaacs.ic.ht',
      path: path
    }, function (regRes) {
      console.log(path + ' ' + regRes.statusCode);
      res.writeHead(regRes.statusCode, regRes.headers);
      regRes.pipe(res);
    });
    h.on('error', function (err) {
      req.writeHead(500);
      res.write('Proxy error!\n');
    });
  }
  else {
    path = req.url;
    console.log(req.url + ' -> ' + path);
    var h = http.get({
      host: 'registry.npmjs.org',
      path: path
    }, function (regRes) {
      var data = '';

      console.log(path + ' ' + regRes.statusCode);
      delete regRes.headers['content-length'];
      res.writeHead(regRes.statusCode, regRes.headers);

      regRes.on('data', function (d) {
        data += d;
      });
      regRes.on('end', function () {
        data = data.replace(/https?:\/\/registry\.npmjs\.org/g, 'http://' + req.headers.host);
        res.end(data);
      });
    });
  }
}, {
  enable: {
    xforward: false
  },
  changeOrigin: true
}).listen(8000);
