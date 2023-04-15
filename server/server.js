import express from 'express';
import http from 'http';
import jsonServer from 'json-server';
import auth from 'json-server-auth';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
let io;
io = new Server(server);

global.io = io;

const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 9000;

// Bind the router db to the app
app.db = router.db;

app.use(middlewares);

const rules = auth.rewriter({
  users: 640,
  conversations: 660,
  messages: 660,
});

app.use(rules);
app.use(auth);
app.use(router);

server.listen(port);
