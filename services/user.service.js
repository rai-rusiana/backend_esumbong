import { AppError } from "../lib/error.js";
import prisma from "../lib/prisma.js"

import { sendToUser } from "../lib/ws.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT_SECRET and REFRESH_SECRET must be defined in environment variables");
}
/**
 * @description
 * Creates a new user in the database.
 * @param {object} userData - The user's data.
 * @returns {Promise<object>} The newly created user object without the password
 */

export const createUser = async (userData) => {
  if (userData.email) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email },
      select: {
        email: true
      }
    })
    if (existingUser?.email) {
      throw new AppError("Email already taken.", 409)
    }
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * @description
 * Authenticates a user by email and password and returns a JWT on success.
 * @param {string} email - The user's email.
 * @param {string} password - The plain-text password.
 * @returns {Promise<object|null>} An object with the user and the JWT if successful, or null if authentication fails.
 */
export const loginUser = async (email, password) => {
  email = email.trim();
  password = password.trim();
  console.log("Login service")
  const user = await prisma.user.findUnique({ where: { email } });
  if (process.env.NODE_ENV !== "production") {
    console.log("User found:", user);
    console.log("Loging attempt", { email, password });
  }
  if (!user) {
    throw new Error("User not found.")
  }
  if (user.isActive === false) {
    throw new Error("You are restricted from using this account.")
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Incorrect password.")
  }
  console.log("give jwt")
  const access = jwt.sign(
    { userId: user.id, type: user.type, isVerified: user.isVerified }, // store 'type' to match middleware
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refresh = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    user: userWithoutPassword,
    access,
    refresh,
  };
};

/**
 * @description
 * Retrieves all users from the database.
 * @returns {Promise<array>} An array of user objects without password
 */

export const getAllUsers = async ({ search, type }) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { fullname: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        } : {},
        type ? {
          type: type
        } : {}
      ]
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      isVerified: true,
      verificationMedia: {
        select: {
          url: true,
          verificationStatus: true,
          isAI: true,
        }
      },
      contactNumber: true,
      type: true,
      isActive: true,
    },
  });
  if (process.env.NODE_ENV === "development") console.log(users)

  return users;
};

/**
 * @description
 * Retrieves a single user from the database by ID.
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} The user object without the password.
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullname: true,
      isVerified: true,
      type: true,
      position: true,
      contactNumber: true,
      address: true,
      profilePhoto: true,
    },
  });
  return user;
};

/**
 * @description
 * Updates an existing user in the database.
 * @param {number} id - The user's ID.
 * @param {object} userData - The updated user's data.
 * @returns {Promise<object>} The updated user object without the password.
 */
export const updateUser = async (id, userData) => {
  const userToUpdate = { ...userData };
  const user = await prisma.user.findFirst({
    where: { id },
    select: { email: true }
  })
  if (userData.email !== user.email) {
    if (userData.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: userData.email },
        select: { email: true },
      });

      if (existingUser) {
        // Instead of throwing, return a custom error object
        const err = new Error("Email already taken.");
        err.code = "EMAIL_TAKEN";
        throw err; // this is fine, but must catch correctly
      }
    }
  }

  if (userData.password) {
    userToUpdate.password = await bcrypt.hash(userData.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: userToUpdate,
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * @description
 * Query users from the database
 * @param {query} string - Query String
 * @param {size} int -  Query Size, number of users returned
 * @param {orderBy} string - Ordered by ascending or descending
 * @returns {Promise<object>} The result of the user objects.
 */
export const queryUsers = async (query, size = 20, orderBy = "asc") => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { fullname: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: size,
    orderBy: { fullname: orderBy },
  });
  return users;
};
export const refreshAccessToken = async (refresh_token) => {
  try {
    const payload = jwt.verify(refresh_token, REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      { userId: user.id, type: user.type, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const newRefreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { user, access: newAccessToken, refresh: newRefreshToken };
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * @description
 * Deletes a user from the database.
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} The deleted user object.
 */
export const toggleUserActive = async (id) => {
  const user = await prisma.user.findFirst({
    where: { id: id },
    select: {
      isActive: true
    }
  })
  return await prisma.user.update({
    where: { id },
    data: {
      isActive: !user.isActive
    }
  });
};
export const sendVerify = async (userId, metaData) => {
  if (process.env.NODE_ENV === "development")console.log(metaData)
  await prisma.media.upsert({
    where: {
      ownerId: userId, // must be UNIQUE in schema
    },
    update: {
      name: metaData.name ?? null,
      url: metaData.url,
      fileSize: metaData.size ?? null,
      fileType: metaData.type ?? null,
      isAI: metaData.isAI ?? false,
      for: "userverification",
      type: metaData.type?.startsWith("image")
        ? "photo"
        : metaData.type?.startsWith("video")
          ? "video"
          : "file",
    },
    create: {
      ownerId: userId,
      name: metaData.name ?? null,
      url: metaData.url,
      fileSize: metaData.size ?? null,
      fileType: metaData.type ?? null,
      isAI: metaData.isAI ?? false,
      for: "userverification",
      type: metaData.type?.startsWith("image")
        ? "photo"
        : metaData.type?.startsWith("video")
          ? "video"
          : "file",
    },
  });
};
export const verifyUser = async (residentId, adminId, verify) => {

  await prisma.$transaction(async (tx) => {
    await tx.media.update({
      where: { ownerId: residentId },
      data: {
        verificationStatus: verify,
        reviewedById: adminId,
        reviewedAt: new Date()
      }
    });

    await tx.user.update({
      where: { id: residentId },
      data: {
        isVerified: verify === "approved" ? true : false
      }
    });
    await prisma.notification.create({
      data: {
        message: "Your account has been verified",
        type: "userVerification",
        userId: residentId,
      },
    });
    const isVerified = verify === "approved" ? true : false
    sendToUser(residentId, {
      type: "USER_VERIFICATION",
      notification: { message: "Your account has been verified", userId: residentId, isVerified, type: "userVerification" }
    })
  });

  return
}

export const checkVerified = async (userId) => {

  const media = await prisma.media.findUnique({
    where: {
      ownerId: userId
    },
    select: {
      verificationStatus: true
    }
  })
  if (!media) {
    return { verificationStatus: "none" }
  }
  if (process.env.NODE_ENV === "development") console.log("Status:", media.verificationStatus)
  return { verificationStatus: media.verificationStatus }
}