const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/discover', optionalAuth, exchangeController.discoverPeers);
router.post('/request', requireAuth, exchangeController.createExchangeRequest);
router.get('/my-exchanges', requireAuth, exchangeController.getMyExchanges);
router.get('/:exchangeId', requireAuth, exchangeController.getExchangeById);
router.put('/:exchangeId/respond', requireAuth, exchangeController.respondToExchange);
router.put('/:exchangeId/complete', requireAuth, exchangeController.completeExchange);

module.exports = router;
