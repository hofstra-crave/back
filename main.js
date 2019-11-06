const Koa = require('koa');
const static_server = require('koa-static');
const Router = require('koa-router');

const app = new Koa();
let router = new Router();

app.use(static_server('./public'));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server is up and running');
});
