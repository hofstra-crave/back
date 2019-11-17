const Koa = require('koa');
const static_server = require('koa-static');
const Router = require('koa-router');
const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.HOST_NAME,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  connectionLimit: 5
});

pool.getConnection().then(() => {
  console.log('Connected to the db');
});

const app = new Koa();
let router = new Router();

app.use(static_server('./public'));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server is up and running');
});
