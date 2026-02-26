import * as notificationService from "../../services/notification.service.js";

export const getUserNotifications = async (req, res) => {
  const userId = req.user?.id || req.user?.userId; // safer extraction
  if (!userId) {
    return res.status(400).json({ error: "User ID is missing or invalid" });
  }
  try {
    const notifications = await notificationService.getUserNotifications(
      userId
    );
    return res.status(200).json({
      data: notifications,
      count: notifications.length,
      success: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error retrieving user notifications", error);
    }
    return res.status(500).json({
      error: "An internal server error has occured while getting notifications",
    });
  }
};
