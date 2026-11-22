const express = require('express');
const cors = require('cors');
const journeyRouter = require('./journey/journeyRouter');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/journey', journeyRouter);

// Basic error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
