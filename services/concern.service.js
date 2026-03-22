import prisma from "../lib/prisma.js"
import { AppError } from "../lib/error.js";
import { sendConcernEmail } from "../lib/email.js";
import { checkAndUpdatePostCount } from "../lib/checkPostLimit.js"
import { sendToUser } from "../lib/ws.js"
const baseUrl = process.env.FRONTEND_URL;

export const createConcern = async (data, categoryId, userId) => {
  const response = await checkAndUpdatePostCount(userId)
  if (!response.allowed) {
    throw new AppError(response.message, 429)
  }
  const newConcern = await prisma.concern.create({
    data: {
      title: data.title,
      details: data.details,
      needsBarangayAssistance: data.needsBarangayAssistance,
      location: data.location,
      userId,
      ...(categoryId && { categoryId }),
      other: data.other ?? null,
      isSpam: data.isSpam ?? false,
      isAnonymous: data.isAnonymous ?? false,
      media: {
        create:
          data.media?.map((m) => ({
            url: m.url,
            name: m.name ?? null,
            fileSize: m.size ?? null,
            fileType: m.type ?? null,
            isAI: m.isAI ?? false,
            type: m.type?.startsWith("image")
              ? "photo"
              : m.type?.startsWith("video")
                ? "video"
                : "file",
          })) || [],
      },
    },
    include: {
      user: true,
    },
  });
  const url = `${baseUrl}/concern/${newConcern.id}`;
  const message = `${newConcern.user.fullname} has filed concern.`;
  const officials = await prisma.user.findMany({
    where: {
      type: "barangay_official",
    },
    select: {
      id: true,
      email: true,
      fullname: true,
    },
  });

  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          itemId: newConcern.id,
          message,
          type: "concern",
          userId: official.id,
        },
      });
      sendToUser(official.id, {
        type: "NEW_NOTIFICATION",
        notification: { url, message, itemId: newConcern.id, type: "concern" }
      })

      if (!process.env.RESEND_API_KEY) return; // Skip email if API key is not set
      await sendConcernEmail(
        official.email,
        official.fullname,
        data.title,
        "filed",
        data.details,
        url,
        data.files
      );
    })
  );
  const stats = await getConcernStats(userId, false)
  sendToUser(userId, {
    type: "NEW_STAT",
    stats
  })
  return newConcern;
};
// !Update COncern
export const updateStatusConcern = async (userId, concernId, data) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      type: "barangay_officials",
    },
  });
  if (user?.type !== "barangay_officials") {
    throw new AppError("Unauthorized", 401)
  }
  const updatedConcern = await prisma.concern.update({
    where: {
      id: concernId,
    },
    data: {
      status: data.status,
    },
  });
  const url = `${baseUrl}/concern/${updatedConcern.id}`;
  const updateMessage =
    data.updateMessage ||
    `Concern has been updated by the Officials to status: ${data.status}`;
  const resident = await prisma.concern.findFirst({
    where: {
      id: concernId,
    },
    select: {
      user: {
        userId: true,
        fullname: true,
      },
    },
  });
  await prisma.notification.create({
    data: {
      url: url,
      message: `Your concern has been ${data.status}`,
      type: "concern",
      userId: resident.user.userId,
    },
  });
  sendToUser(resident.user.userId, {
    type: "NEW_NOTIFICATION",
    notification: { url, message: `Your concern has been ${data.status}`, type: "concern" }
  })
  sendToUser(resident.user.id, {
    type: "UPDATE",
    update: { id: resident.id, message, type: "concern" }
  })
  const concernUpdate = await prisma.concernUpdate.create({
    data: {
      updateMessage: updateMessage,
      concernId: concernId,
      status: data.status,
      media: {
        create:
          data.media?.map((m) => ({
            url: m.url,
            name: m.name ?? null,
            fileSize: m.size ?? null,
            fileType: m.type ?? null,
            isAI: m.isAI ?? false,
            type: m.type?.startsWith("image")
              ? "photo"
              : m.type?.startsWith("video")
                ? "video"
                : "file",
          })) || [],
      },
    },
  });
  return concernUpdate;
};



export const getConcernById = async (concernId) => {
  const concern = await prisma.concern.findFirst({
    where: {
      id: parseInt(concernId),
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullname: true,
          contactNumber: true,
          email: true,
          type: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      title: true,
      media: {
        select: {
          id: true,
          url: true,
          type: true,
          isAI: true
        },
      },
      other: true,
      status: true,
      validation: true,
      isAnonymous: true,
      details: true,
      issuedAt: true,
      needsBarangayAssistance: true,
      updatedAt: true,
    },
  });
  return concern;
};
export const getAllConcerns = async ({ search, status, archived, validation, recent, spam, isAnonymous, cursor, take = 20 }) => {
  const results = await prisma.concern.findMany({
    take: recent ? 5 : take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      AND: [
        ["approved", "pending", "rejected"].includes(status) ? { validation: status } : {},
        ["assigned", "resolved", "validated"].includes(status) ? { status } : {},
        recent !== undefined ? { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
            { user: { fullname: { contains: search, mode: "insensitive" } } },
            { category: { name: { contains: search, mode: "insensitive" } } },
          ],
        } : {},
        archived !== undefined ? { isArchived: archived } : {},
        validation !== undefined ? { validation } : {},
        spam !== undefined ? { isSpam: spam } : {},
        isAnonymous !== undefined ? { isAnonymous } : {},
      ],
    },
    select: {
      id: true,
      title: true,
      details: true,
      validation: true,
      isSpam: true,
      isArchived: true,
      archivedOn: true,
      issuedAt: true,
      updatedAt: true,
      status: true,
      needsBarangayAssistance: true,
      other: true,
      validatedBy: {
        select: {
          id: true,
          fullname: true,
        },
      },
      user: {
        select: {
          id: true,
          fullname: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  const hasNextPage = results.length > take;
  const data = hasNextPage ? results.slice(0, take) : results;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return { data, nextCursor, hasNextPage };
};

export const getConcernStats = async (userId, isOfficial) => {
  const result = await prisma.concern.groupBy({
    by: ["status"],
    where: isOfficial ? {} : { userId },
    _count: {
      status: true
    }
  })
  const stats = {
    pending: 0,
    inProgress: 0,
    verified: 0,
    canceled: 0,
    approved: 0,
    rejected: 0,
    resolved: 0
  }
  result.forEach((item) => {
    stats[item.status] = item._count.status
  })
  return stats
}

export const getResidentConcerns = async (userId, cursor, take = 20) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const results = await prisma.concern.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),

    where: {
      userId: userId,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const hasNextPage = results.length > take;
  const data = hasNextPage ? results.slice(0, take) : results;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return { data, nextCursor, hasNextPage };
};

export const getConcernUpdates = async (concernId) => {
  return await prisma.concernUpdate.findMany({
    where: {
      concernId,
    },
  });
};

export const validateConcern = async (concernId, data, userId, resolve) => {
  const now = new Date();
  // 1️⃣ Update the concern with validation info
  await prisma.concernUpdate.create({
    data: {
      updateMessage: data.updateMessage || `Concern has been ${data.validation} by the barangay official.`,
      status: data.validation,
      media: {
        create:
          data.media?.map((m) => ({
            url: m.url,
            name: m.name ?? null,
            fileSize: m.size ?? null,
            fileType: m.type ?? null,
            isAI: m.isAI ?? false,
            type: m.type?.startsWith("image")
              ? "photo"
              : m.type?.startsWith("video")
                ? "video"
                : "file",
          })) || [],
      },
      concernId
    }
  })
  let updatedConcern;
  if (resolve === "resolve") {
    updatedConcern = await prisma.concern.update({
      where: { id: concernId },
      data: {
        status: resolve, // <-- only status updated
      },
      include: {
        user: true, // to get the resident
      },
    });
  } else {
    updatedConcern = await prisma.concern.update({
      where: { id: concernId },
      data: {
        validation: data.validation,
        validatedById: userId,
        validatedAt: now,
        status: "inProgress"
      },
      include: {
        user: true, // to get the resident
      },
    });
  }

  const url = `${baseUrl}/concern/${updatedConcern.id}`;
  const message = `Your concern "${updatedConcern.title}" has been ${data.validation}.`;

  // 2️⃣ Notify the resident
  await prisma.notification.create({
    data: {
      url,
      itemId: updatedConcern.id,
      message,
      type: "concern",
      userId: updatedConcern.user.id, // resident who filed it
    },
  });
  sendToUser(updatedConcern.user.id, {
    type: "UPDATE",
    update: { id: updatedConcern.id, message, type: "concern" }
  })
  sendToUser(updatedConcern.user.id, {
    type: "NEW_NOTIFICATION",
    notification: { url, message, itemId: updatedConcern.id, type: "concern" }
  })

  if (process.env.RESEND_API_KEY) {
    await sendConcernEmail(
      updatedConcern.user.email,  // to
      updatedConcern.user.fullname, // fullname
      updatedConcern.title,        // title
      data.validation,
      updatedConcern.details,      // details
      url                           // link to concern
    );
  }



  // 3️⃣ Notify all barangay officials (similar to createConcern)
  const officials = await prisma.user.findMany({
    where: { type: "barangay_official" },
    select: { id: true, email: true, fullname: true },
  });
  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          itemId: updatedConcern.id,
          message: `${updatedConcern.user.fullname}'s concern has been ${data.validation}.`,
          type: "concern",
          userId: official.id,
        },
      });
      if (process.env.RESEND_API_KEY) {
        await sendConcernEmail(
          official.email,             // to
          official.fullname,          // fullname
          updatedConcern.title,       // title
          data.validation,
          updatedConcern.details,     // details
          url                         // link to concern
        );
      }
    })
  );

  return;
};

export const archiveConcern = async (concernId, userId) => {
  const concern = await prisma.concern.findFirst({
    where: {
      id: concernId
    },
    select: {
      isArchived: true
    }
  })
  return await prisma.concern.update({
    where: {
      id: concernId
    },
    data: {
      isArchived: !concern.isArchived,
      ArchivedById: userId,
      archivedOn: new Date()
    }
  })
}

export const getConcernUpdatesById = async (concernId) => {
  return await prisma.concernUpdate.findMany({
    where: {
      concernId
    },
    include: {
      media: true,
    }
  })
}

export const deleteConcern = async (concernId, userId) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      id: true,
      fullname: true,
      email: true,
    }
  })
  const concern = await prisma.concern.findFirst({
    where: { id: concernId },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
        }
      }
    }
  })
  const message = `Your concern "${concern.title}" has been deleted.`;

  // 2️⃣ Notify the resident
  await prisma.notification.create({
    data: {
      url: "",
      message,
      type: "concern",
      userId: concern.user.id, // resident who filed it
    },
  });
  sendToUser(concern.user.id, {
    type: "NEW_NOTIFICATION",
    notification: { message, type: "concern", userId: concern.user.id }
  })
  const officials = await prisma.user.findMany({
    where: {
      type: "barangay_official"
    },
    select: {
      id: true,
      email: true,
      fullname: true,
    }
  })

  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          itemId: concern.id,
          message: `${concern.user.fullname}'s concern has been deleted by ${user.fullname === concern.user.fullname ? "the concern compliant" : user.fullname}.`,
          type: "concern",
          userId: official.id,
        },
      });

    })
  )
  await prisma.concern.delete({
    where: {
      id: concernId
    }
  })
  return
}

export const getUpdatedConcerns = async (userId, cursor, take = 20) => {

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      id: true,
    }
  })
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const id = user.id;
  const results = await prisma.concernUpdate.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      concern: {
        userId: id,
      }
    },
    select: {
      id: true,
      concernId: true,
      createdAt: true,
      status: true,
      updateMessage: true,
      media: true,
      concern: {
        select: {
          title: true,
          other: true,
          category: {
            select: {
              name: true,
            }
          }
        }
      }
    }
  })
  if (process.env.NODE_ENV === "development") console.log("Concern histories fetched:", results)


  const hasNextPage = results.length > take;
  const data = hasNextPage ? results.slice(0, take) : results;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return { data, nextCursor, hasNextPage };
}

export const userConcernMessage = async (userId, concernId, data) => {

  await prisma.concernMessage.create({
    data: {
      userId,
      concernId,
      message: data.message,
      media: {
        create:
          data.media?.map((m) => ({
            url: m.url,
            name: m.name ?? null,
            fileSize: m.size ?? null,
            fileType: m.type ?? null,
            isAI: m.isAI ?? false,
            type: m.type?.startsWith("image")
              ? "photo"
              : m.type?.startsWith("video")
                ? "video"
                : "file",
          })) || [],
      },
    }
  })
  return
}


export const deleteConcernMessage = async (id) => {
  const message = await prisma.concernMessage.findFirst({
    where: { id }
  })
  if (!message) {

    throw new AppError("Message not found", 404)
  }
  await prisma.concernMessage.delete({
    where: { id }
  })
}


/**
 * Returns exactly 1 concern per status group: pending, inProgress, resolved.
 * Skips any concern marked as isAnonymous.
 */
export const getPublicSampleConcerns = async () => {
  const statuses = ["pending", "inProgress", "resolved"]

  const results = await Promise.all(
    statuses.map((status) =>
      prisma.concern.findFirst({
        where: {
          status,
          isAnonymous: false,
          isArchived: false,
        },
        select: {
          id: true,
          title: true,
          details: true,
          status: true,
          issuedAt: true,
          location: true,
          needsBarangayAssistance: true,
          category: {
            select: { name: true },
          },
          updates: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              updateMessage: true,
              status: true,
              createdAt: true,
            },
          },
          // Do NOT expose user identity on public endpoint
        },
      })
    )
  )

  // Filter out nulls (status group may have no concerns yet)
  return results.filter(Boolean)
}

/**
 * Returns a single concern by ID for the public read-only page.
 * Throws 404 if not found, anonymous, or archived.
 */
export const getPublicConcernById = async (id) => {
  const concern = await prisma.concern.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      details: true,
      status: true,
      issuedAt: true,
      updatedAt: true,
      location: true,
      isAnonymous: true,
      isArchived: true,
      needsBarangayAssistance: true,
      other: true,
      category: {
        select: { name: true },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          updateMessage: true,
          status: true,
          createdAt: true,
          media: {
            select: { url: true, type: true, name: true },
          },
        },
      },
      media: {
        select: { url: true, type: true, name: true },
      },
      // No user field — keep reporter identity private on public page
    },
  })

  if (!concern) {
    throw new AppError("Concern not found", 404)
  }

  if (concern.isAnonymous || concern.isArchived) {
    throw new AppError("This concern is not publicly viewable", 404)
  }

  return concern
}