import { Router } from "express";

const router = new Router();

import * as concernPost from "../controllers/concern/concern.post.js";
import * as concernQuery from "../controllers/concern/concern.Query.js";
import * as concernPublic from "../controllers/concern/concern.public.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

// ─── PUBLIC routes (no auth) — must be defined BEFORE /:id ───────────────────
router.get("/public/sample", concernPublic.getPublicSampleConcerns)
router.get("/public/:id", concernPublic.getPublicConcernById)

// ─── Protected routes ────────────────────────────────────────────────────────
router.patch("/archive/:id",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernPost.archiveConcern
)
router.patch("/validate/:id",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernPost.validateConcern
)

router.get("/updates/:id",
  authenticateToken,
  concernQuery.getConcernUpdatesById
)
router.get("/stats",
  authenticateToken,
  concernQuery.getConcernStats
)
router.get("/history",
  authenticateToken,
  concernQuery.getConcernHistory
)

router.post(
  "/",
  authenticateToken,
  authorizeRole("resident"),
  concernPost.createConcern
);

router.get("/",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernQuery.getAllConcern
)

router.get(
  "/:id",
  authenticateToken,
  concernQuery.getConcernById
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["resident", "barangay_official"]),
  concernPost.deleteConcern
)

router.get("/user/:id",
  authenticateToken,
  concernQuery.getConcernsByUserId
)

export default router;