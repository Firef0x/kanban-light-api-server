"use strict";

Object.defineProperty(exports, '__esModule', { value: true });

const sendResponse = (res, next) => (obj) => {
  res.send(200, obj);
  next();
};
exports.sendResponse = sendResponse;

const sendError = (next) => (err) => {
  console.log(err);
  next(err);
};
exports.sendError = sendError;
