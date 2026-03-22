import { Router } from "express"
import * as statsPublic from "../controllers/stats/stats.public.js"

const router = new Router()

// GET /api/stats/public — no auth
router.get("/public", statsPublic.getPublicStats)

export default router