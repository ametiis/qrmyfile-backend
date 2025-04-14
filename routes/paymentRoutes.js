const express = require('express');
const router = express.Router();
const { createOrder, captureOrder, paypalWebhook } = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');

router.post('/payments/create-order', authenticate, createOrder);
router.post('/payments/capture-order', authenticate, captureOrder);
router.post('/paypal/webhook', express.json({ type: '*/*' }), paypalWebhook);
module.exports = router;
