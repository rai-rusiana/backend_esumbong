

import { Router } from "express"
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js"
import * as feedbackPostController from "../controllers/feedback/feedback.post.js"
import * as feedbackGetController from "../controllers/feedback/feedback.query.js"
const router = Router()

router.post("/", authenticateToken, authorizeRole("resident"),
    feedbackPostController.createFeedback
)


router.get("/", authenticateToken, feedbackGetController.getFeedbackByUserOrAll)

router.get("/:id", authenticateToken, feedbackGetController.getFeedbackById)

router.delete("/:id", authenticateToken, feedbackPostController.deleteFeedback)

router.patch("/:id", authenticateToken, feedbackPostController.updateFeedbackById)
export default router