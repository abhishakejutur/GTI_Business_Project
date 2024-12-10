const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 300;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === '/dashboard') {
      app.render(req, res, '/dashboard', query);
    } else if (pathname === '/Forecast') {
      app.render(req, res, '/Forecast', query);
    } else if (pathname === '/handsontable') {
      app.render(req, res, '/handsontable', query);
    } else if (pathname === '/Shipping_plan') {
      app.render(req, res, '/Shipping_plan', query);
    } else if (pathname === '/exclude') {
      app.render(req, res, '/exclude', query);
    } else if (pathname === '/partcosts') {
      app.render(req, res, '/partcosts', query);
    } else if (pathname === '/access') {
      app.render(req, res, '/access', query);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
