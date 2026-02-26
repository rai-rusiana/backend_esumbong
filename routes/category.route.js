import { Router } from "express";
import {
  authenticateToken,
  authorizeRole
} from "../middleware/auth.middleware.js"
const router = new Router();

import * as categoryPost from "../controllers/category/category.post.js";
import * as categoryQuery from "../controllers/category/category.query.js";

router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin", "barangay_official"]),
  categoryPost.createCategoryController
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "barangay_official"]),
  categoryPost.updateCategoryController
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "barangay_official"]),
  categoryPost.deleteCategoryController
);

router.get("/", authenticateToken, categoryQuery.getAllCategoryController);


export default router