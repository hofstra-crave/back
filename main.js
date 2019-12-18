const Koa = require('koa');
const static_server = require('koa-static');
const Router = require('koa-router');
const mariadb = require('mariadb');
const http = require('http');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.HOST_NAME,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  connectionLimit: 5,
  database: 'Team Crave'
});

pool.getConnection().then(() => {
  console.log('Connected to the db');
});

const app = new Koa();
let router = new Router();

app.use(static_server('./public'));

// Get Restaurant
router.get('/getRestaurant/:id', async (context, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `SELECT * FROM Restaurantz WHERE Name = "${context.params.id}" `
    );
    const data = await response[0];
    context.response.body = data;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
});

router.get('/getRatings/:id/:sent', async (context, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `SELECT * FROM Reviewz WHERE Restaurant_ID = ${context.params.id} AND Sentiment = "${context.params.sent}"`
    );
    const data = await response;
    context.response.body = data;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
});

router.get('/getRestaurantByID/:id', async (context, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `SELECT * FROM Restaurantz WHERE Restaurant_ID = "${context.params.id}"`
    );
    const data = await response;
    context.response.body = data;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3003, () => {
  console.log('Server running on port 3003');
});

// const httpServer = http.createServer(app.callback());

// httpServer.listen(80, () => {
//   console.log('HTTP Server running on port 80');
// });
