
import { Router } from "express";

const router = new Router();

import * as concernPost from "../controllers/concern/concern.post.js";
import * as concernQuery from "../controllers/concern/concern.Query.js";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";


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
router.get("/stats", authenticateToken,
  concernQuery.getConcernStats
)
router.get("/history",
  authenticateToken,
  concernQuery.getConcernHistory
)

//router.post("/message/:id", 
//  authenticateToken,
//  concernPost.userConcernMessage
//)

//router.delete("/message/:id", 
//  authenticateToken,
//  concernPost.deleteConcernMessage
//)

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

router.get("/user/:id", authenticateToken,
  concernQuery.getConcernsByUserId)
export default router;
