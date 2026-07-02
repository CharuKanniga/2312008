const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { validateFetch, validateCreate } = require("../middleware/validator");

// GET /api/notifications - Get paginated list
router.get("/", validateFetch, notificationController.getNotifications);

// GET /api/notifications/unread-count - Get total unread count
// Note: Put specific routes BEFORE generic parameter routes (like /:id) so they match correctly
router.get("/unread-count", notificationController.getUnreadCount);

// POST /api/notifications - Create notification
router.post("/", validateCreate, notificationController.createNotification);

// POST /api/notifications/mark-all-read - Mark all as read
router.post("/mark-all-read", notificationController.markAllRead);

// PATCH /api/notifications/:id/read - Mark individual as read
router.patch("/:id/read", notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
