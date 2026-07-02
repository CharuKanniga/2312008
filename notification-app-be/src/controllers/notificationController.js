const notificationService = require("../services/notificationService");
const { logInfo, logWarn } = require("../middleware/logging");

/**
 * Controller class coordinating notification endpoints.
 */
class NotificationController {
    /**
     * GET /api/notifications
     */
    async getNotifications(req, res, next) {
        try {
            const { type, page, limit, read } = req.query;
            await logInfo("controller", `Fetching notifications with params - type: ${type || "All"}, page: ${page || 1}`);
            
            const result = await notificationService.getAll({ type, page, limit, read });
            
            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/notifications
     */
    async createNotification(req, res, next) {
        try {
            const { type, title, message } = req.body;
            await logInfo("controller", `Request to create notification: [${type}] "${title}"`);
            
            const notification = await notificationService.create({ type, title, message });
            
            return res.status(201).json({
                success: true,
                notification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/notifications/:id/read
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            await logInfo("controller", `Request to mark notification read: ID ${id}`);
            
            const notification = await notificationService.markAsRead(id);
            if (!notification) {
                await logWarn("controller", `Notification not found for read update: ID ${id}`);
                return res.status(404).json({
                    success: false,
                    error: `Notification with ID "${id}" not found.`
                });
            }

            return res.status(200).json({
                success: true,
                message: "Notification marked as read successfully.",
                notification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/notifications/mark-all-read
     */
    async markAllRead(req, res, next) {
        try {
            await logInfo("controller", "Request to mark all notifications read");
            
            const affectedCount = await notificationService.markAllRead();
            
            return res.status(200).json({
                success: true,
                message: "All notifications marked as read successfully.",
                count: affectedCount
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/notifications/unread-count
     */
    async getUnreadCount(req, res, next) {
        try {
            await logInfo("controller", "Request to get unread notification count");
            
            const count = await notificationService.getUnreadCount();
            
            return res.status(200).json({
                success: true,
                unreadCount: count
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/notifications/:id
     */
    async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            await logInfo("controller", `Request to delete notification: ID ${id}`);
            
            const success = await notificationService.delete(id);
            if (!success) {
                await logWarn("controller", `Notification not found for deletion: ID ${id}`);
                return res.status(404).json({
                    success: false,
                    error: `Notification with ID "${id}" not found.`
                });
            }

            return res.status(200).json({
                success: true,
                message: "Notification deleted successfully."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
