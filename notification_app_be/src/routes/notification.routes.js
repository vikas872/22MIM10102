const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  getPriorityInbox,
} = require("../controller/notification.controller");

// GET /notifications         → all notifications
// GET /notifications/priority?n=10  → top n by priority
router.get("/", getAllNotifications);
router.get("/priority", getPriorityInbox);

module.exports = router;