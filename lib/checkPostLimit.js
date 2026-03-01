// lib/checkPostLimit.ts
import { prisma } from "./prisma.js";
import { AppError } from "./error.js";
export async function checkAndUpdatePostCount(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyPostCount: true, lastPostReset: true },
  });

  if (!user) throw new AppError("User not found", 404);

  const now = new Date();
  const lastReset = new Date(user.lastPostReset);

  // Check if it's past 12am of a new day
  const isNewDay =
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  // Reset count if new day
  if (isNewDay) {
    await prisma.user.update({
      where: { id: userId },
      data: { dailyPostCount: 0, lastPostReset: now },
    });
    user.dailyPostCount = 0;
  }

  // Block if limit reached
  if (user.dailyPostCount >= 10) {
    return { allowed: false, message: "You have reached the daily post limit of 10. Try again tomorrow." };
  }

  // Increment count
  await prisma.user.update({
    where: { id: userId },
    data: { dailyPostCount: { increment: 1 } },
  });

  return { allowed: true, count: user.dailyPostCount + 1 };
}