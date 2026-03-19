let http = require('http');
let fs = require('fs');

const server = http.createServer((req, res) => {
  fs.readFile('index.html', (err, html) => {
    if (err) {
      throw err;
    }
    req.writeHead(200, {'Content-Type' : 'text/html'});
    res.end(html);
  });
});

server.listen(3000, () => {
  console.log('Server Running')
});