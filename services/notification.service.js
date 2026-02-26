import prisma from "../lib/prisma.js"


export const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteNotification = async (id) => {
  return await prisma.notification.delete({
    where: {
      id: parseInt(id),
    },
  });
};

export const deleteAllUserNotifications = async (userId) => {
  return await prisma.notification.deleteMany({
    where: {
      userId
    },
  });
};
