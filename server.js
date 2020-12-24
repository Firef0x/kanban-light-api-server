"use strict";

Object.defineProperty(exports, '__esModule', { value: true });

const Logger = require('bunyan').createLogger;
const restify = require('restify');
const restifyBunyanLogger = require('restify-bunyan-logger');
const NeDBDataStore = require('nedb');
const CardModelLib = require('./CardModel').default;
const utils = require('./utils');

const PORT = 3001;
const PREFIX = '/api/v1';
const db = new NeDBDataStore({ filename: 'kanbanDb.json', autoload: true });
const cardModel = new CardModelLib(db);
const corsHandler = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Expose-Headers',
    'X-Api-Version, X-Request-Id, X-Response-Time');
  res.setHeader('Access-Control-Max-Age', '1000');
  return next();
};

const optionsRoute = (req, res, next) => {
  res.send(200);
  return next();
};

const server = restify.createServer({
  log: new Logger({
    name: 'kanban-light-api-server',
    streams: [{
      path: 'kanban-light-api-server.log',
    }]
  })
});
server.use(restify.CORS({
  credentials: true,
  methods: ['GET', 'PUT', 'DELETE', 'POST', 'OPTIONS']
}));
server.use(restify.bodyParser());
server.get(`${PREFIX}/cards`, (req, res, next) => {
  cardModel
    .findAll()
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.post(`${PREFIX}/cards/:cardId/tasks`, (req, res, next) => {
  const cardId = Number(req.params.cardId);
  const newTask = req.body;
  cardModel
    .addTask(cardId, newTask)
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.del(`${PREFIX}/cards/:cardId/tasks/:taskId`, (req, res, next) => {
  const cardId = Number(req.params.cardId);
  const taskId = Number(req.params.taskId);
  cardModel
    .deleteTask(cardId, taskId)
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.put(`${PREFIX}/cards/:cardId/tasks/:taskId`, (req, res, next) => {
  const cardId = Number(req.params.cardId);
  const taskId = Number(req.params.taskId);
  const status = Boolean(req.body.done);
  cardModel
    .updateTaskStatus(cardId, taskId, status)
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.put(`${PREFIX}/cards/:cardId`, (req, res, next) => {
  const cardId = Number(req.params.cardId);
  const card = req.body;
  cardModel
    .updateCard(cardId, card)
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.post(`${PREFIX}/cards`, (req, res, next) => {
  const card = req.body;
  cardModel
    .addCard(card)
    .then(utils.sendResponse(res, next))
    .catch(utils.sendError);
});
server.listen(PORT, () => {
  console.log(`${server.name} listening at ${server.url}`);
});
server.opts('/\.*/', corsHandler, optionsRoute);
server.on('after', restifyBunyanLogger({
  skip: (req, res) => req.method === 'OPTIONS' || req.method === 'HEAD'
}));
