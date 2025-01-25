const express = require('express');
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middlewares/authMiddleware');
const alertRoute = express.Router();
alertRoute.get('/',authMiddleware, alertController.getLogs);
alertRoute.get('/duration',authMiddleware, alertController.getLogsByTime);

module.exports = alertRoute;