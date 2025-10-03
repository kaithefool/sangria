const express = require('express');
const path = require('path');
const httpError = require('http-errors');

module.exports = (...paths) => {
  const mid = express.static(
    path.resolve(...paths),
  );

  return (req, res, next) => {
    mid(req, res, () => {
      next(httpError(404, 'res.notFound'));
    });
  };
};
