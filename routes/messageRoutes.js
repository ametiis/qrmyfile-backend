const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { sendMessage,
    getConversation,
    markAsRead } = require('../controllers/messageController');


router.post('', authenticate, sendMessage);
router.get('/:otherUserId', authenticate, getConversation);
router.post('/mark-as-read', authenticate, markAsRead);

module.exports = router;
