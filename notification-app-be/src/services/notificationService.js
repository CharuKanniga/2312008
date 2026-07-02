const Notification = require("../models/Notification");
const { logInfo, logError } = require("../middleware/logging");

/**
 * Service class handling DB business logic for Notifications.
 */
class NotificationService {
    /**
     * Fetch paginated list of notifications with type and read filters.
     */
    async getAll({ type, page = 1, limit = 10, read }) {
        try {
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const offset = (pageNum - 1) * limitNum;

            const where = {};
            if (type && type !== "All") {
                where.type = type;
            }
            if (read !== undefined) {
                where.read = read === "true";
            }

            const { count, rows } = await Notification.findAndCountAll({
                where,
                limit: limitNum,
                offset,
                order: [["createdAt", "DESC"]]
            });

            const totalPages = Math.ceil(count / limitNum);

            return {
                notifications: rows,
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages
            };
        } catch (error) {
            await logError("service", `Error fetching notifications: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a new notification.
     */
    async create({ type, title, message }) {
        try {
            const notification = await Notification.create({ type, title, message });
            await logInfo("service", `Successfully created notification: [${type}] ${title}`);
            return notification;
        } catch (error) {
            await logError("service", `Error creating notification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Mark a specific notification as read.
     */
    async markAsRead(id) {
        try {
            const notification = await Notification.findByPk(id);
            if (!notification) {
                return null;
            }

            notification.read = true;
            await notification.save();

            await logInfo("service", `Marked notification as read: ID ${id}`);
            return notification;
        } catch (error) {
            await logError("service", `Error marking notification as read (ID: ${id}): ${error.message}`);
            throw error;
        }
    }

    /**
     * Mark all unread notifications as read.
     */
    async markAllRead() {
        try {
            const [affectedCount] = await Notification.update(
                { read: true },
                { where: { read: false } }
            );

            await logInfo("service", `Marked all notifications as read. Affected: ${affectedCount}`);
            return affectedCount;
        } catch (error) {
            await logError("service", `Error marking all notifications as read: ${error.message}`);
            throw error;
        }
    }

    /**
     * Count all unread notifications.
     */
    async getUnreadCount() {
        try {
            const count = await Notification.count({ where: { read: false } });
            return count;
        } catch (error) {
            await logError("service", `Error getting unread count: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete a notification.
     */
    async delete(id) {
        try {
            const notification = await Notification.findByPk(id);
            if (!notification) {
                return false;
            }

            await notification.destroy();
            await logInfo("service", `Deleted notification: ID ${id}`);
            return true;
        } catch (error) {
            await logError("service", `Error deleting notification (ID: ${id}): ${error.message}`);
            throw error;
        }
    }
}

module.exports = new NotificationService();
