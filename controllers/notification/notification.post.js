import * as NotificationService from "../../services/notification.service.js";

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required." });
    }

    const deleted = await NotificationService.deleteNotification(Number(id));

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon deleting a notification:", error);
    }
    return res.status(500).json({
      error: "A server error has occurred.",
    });
  }
};

export const deleteAllUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user not found in request." });
    }

    const result = await NotificationService.deleteAllUserNotifications(Number(userId));

    return res.status(200).json({
      message: `Deleted ${result.count} notifications.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error upon deleting all notifications:", error);
    return res.status(500).json({
      error: "A server error has occurred.",
    });
  }
};
