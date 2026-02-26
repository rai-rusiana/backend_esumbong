
import {Router} from "express"
import { authenticateToken } from "../middleware/auth.middleware.js"
import * as notificationQuery from "../controllers/notification/notification.query.js"
import * as notificationPost from "../controllers/notification/notification.post.js"
const router = new Router()

router.get("/", authenticateToken, notificationQuery.getUserNotifications)


router.delete("/delete/", authenticateToken, notificationPost.deleteNotification)


router.delete("/deleteAll/", authenticateToken, notificationPost.deleteAllUserNotifications)

export default router