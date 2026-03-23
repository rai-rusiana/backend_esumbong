import * as notificationService from "../../services/notification.service.js";

// ─── GET /api/notification/me?cursor=&take= ───────────────────────────────────
export const getUserNotifications = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  if (!userId) return res.status(400).json({ error: "User ID missing" });

  const { cursor, take } = req.query;

  try {
    const result = await notificationService.getUserNotifications(
      userId,
      cursor || null,
      take ? parseInt(take) : 20
    );
    return res.status(200).json({ ...result, success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ─── PATCH /api/notification/:id/read ────────────────────────────────────────
export const markNotificationRead = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  const { id } = req.params;
  try {
    await notificationService.markNotificationRead(id, userId);
    return res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to mark as read" });
  }
};

// ─── PATCH /api/notification/read-all ────────────────────────────────────────
export const markAllNotificationsRead = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  try {
    const result = await notificationService.markAllNotificationsRead(userId);
    return res.status(200).json({ message: `Marked ${result.count} as read` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// ─── DELETE /api/notification/:id ────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await notificationService.deleteNotification(Number(id));
    return res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete notification." });
  }
};

// ─── DELETE /api/notification/all ────────────────────────────────────────────
export const deleteAllUserNotifications = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const result = await notificationService.deleteAllUserNotifications(Number(userId));
    return res.status(200).json({ message: `Deleted ${result.count} notifications.` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete all notifications." });
  }
};