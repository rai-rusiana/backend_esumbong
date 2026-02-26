// middleware/auth.middleware.js
// This file acts as the 'bouncer' for our protected routes.

import jwt from "jsonwebtoken";
// In a real-world application, this secret key must be stored securely
// in an environment variable, like process.env.JWT_SECRET.
import prisma from "../lib/prisma.js"

/**
 * @description
 * Middleware to check for a valid JWT in the request header.
 */

const JWT_SECRET = process.env.JWT_SECRET;
export const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verify failed:", err.message);
      
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
};
/**
 * @description
 * Middleware to check for a specific role(s).
 * @param {string|string[]} requiredRole - A single role string or an array of role strings.
 */

export const authorizeRole = (requiredRoles) => (req, res, next) => {
  const userRole = req.user.type;

  // Check if requiredRoles is a string or an array
  const rolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  // If the user's role is not included in the required roles array, deny access.
  if (!rolesArray.includes(userRole)) {
    return res.status(403).json({
      error: "You do not have the necessary permissions.",
    });
  }

  next();
};

/**
 * @description
 * Middleware to check if the authenticated user is the owner of a specific resource.
 * It fetches the resource from the database and compares its ownerId with the
 * authenticated user's ID from the JWT payload.
 *
 * @param {string} modelName - The name of the Prisma model ('branch' or 'store').
 * @param {string} paramId - The name of the request parameter containing the resource ID ('id').
 */

export const authorizeUser = (modelName, paramId) => {
  return async (req, res, next) => {
    const userId = req.user.userId;
    const resourceId = parseInt(req.params[paramId]);
    if (!userId || isNaN(resourceId)) {
      return res
        .status(400)
        .json({
          error: "Invalid request parameters or missing user information.",
        });
    }

    // Dynamically query the correct Prisma model based on the `modelName` argument.
    try {
      const resource = await prisma[modelName].findUnique({
        where: { id: resourceId },
        select: { ownerId: true },
      });
      if (!resource) {
        return res.status(404).json({
          error: `${modelName} not found`,
        });
      }
      if (resource.ownerId !== userId) {
        return res.status(403).json({
          error: "You do not have permission to access this resource",
        });
      }
      next();
    } catch (error) {
      console.error(
        `Error in authorizeOwner middleware for ${modelName}:`,
        error
      );
      res.status(500).json({
        error: "An internal server error has occured.",
      });
    }
  };
};
