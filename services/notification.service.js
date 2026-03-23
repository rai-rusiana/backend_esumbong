import prisma from "../lib/prisma.js"



/**
 * Paginated notifications for a user.
 * Returns { data, nextCursor, hasNextPage, unreadCount }
 */
export const getUserNotifications = async (userId, cursor, take = 20) => {
  const results = await prisma.notification.findMany({
    where: { userId: parseInt(userId) },
    select: {
      id: true,
      url: true,
      itemId: true,
      message: true,
      createdAt: true,
      type: true,
      read: true,
    },
    orderBy: { createdAt: "desc" },
    ...(cursor ? { cursor: { id: parseInt(cursor) }, skip: 1 } : {}),
    take: take + 1,
  });
 
  const hasNextPage = results.length > take;
  const data = hasNextPage ? results.slice(0, take) : results;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;
 
  const unreadCount = await prisma.notification.count({
    where: { userId: parseInt(userId), read: false },
  });
 
  return { data, nextCursor, hasNextPage, unreadCount };
};
 
/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id: parseInt(id), userId: parseInt(userId) },
    data: { read: true },
  });
};
 
/**
 * Mark all notifications for a user as read.
 */
export const markAllNotificationsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId: parseInt(userId), read: false },
    data: { read: true },
  });
};
 
export const deleteNotification = async (id) => {
  return await prisma.notification.delete({
    where: { id: parseInt(id) },
  });
};
 
export const deleteAllUserNotifications = async (userId) => {
  return await prisma.notification.deleteMany({
    where: { userId },
  });
};