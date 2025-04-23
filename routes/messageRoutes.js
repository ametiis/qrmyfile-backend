const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { sendMessage,
    getMessages,
    markAsRead, getMyConversations,getUnreadCount } = require('../controllers/messageController');


router.post('/', authenticate, sendMessage);
router.get('/unread-count', authenticate, getUnreadCount);

router.get('/:otherUserId', authenticate, getMessages);
router.post('/mark-as-read', authenticate, markAsRead);
router.get('/', authenticate, getMyConversations);

module.exports = router;
