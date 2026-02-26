
import { Router } from "express"
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js"
import * as announcementPost from "../controllers/announcement/announcement.post.js"

import * as announcementQuery from "../controllers/announcement/announcement.query.js"
const router = new Router()

router.post("/",
    authenticateToken,
    authorizeRole("barangay_official"),
    announcementPost.createAnnouncement
)

//router.get("/", announcementQuery.getAllAnnouncements)
router.patch("/:id",
    authenticateToken,
    authorizeRole("barangay_official"),
    announcementPost.updateAnnouncement
)
router.get("/:id", authenticateToken, announcementQuery.getAnnouncementById)
router.get("/", authenticateToken, announcementQuery.getAllAnnouncements)
router.delete("/:id", authenticateToken, authorizeRole("barangay_official"), announcementPost.deleteAnnouncement)


export default router