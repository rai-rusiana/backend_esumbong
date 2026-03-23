import { Router } from "express"
import { authenticateToken } from "../middleware/auth.middleware.js"
import * as notificationController from "../controllers/notification/notification.controller.js"

const router = new Router()

router.get("/me", authenticateToken, notificationController.getUserNotifications)

// Mark read — specific first, then wildcard :id
router.patch("/read-all", authenticateToken, notificationController.markAllNotificationsRead)
router.patch("/:id/read", authenticateToken, notificationController.markNotificationRead)

router.delete("/all", authenticateToken, notificationController.deleteAllUserNotifications)
router.delete("/:id", authenticateToken, notificationController.deleteNotification)

export default router