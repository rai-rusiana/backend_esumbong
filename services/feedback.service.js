import { AppError } from "../lib/error.js";
import prisma from "../lib/prisma.js"
const baseUrl = process.env.FRONTEND_URL;
import { UserType } from "@prisma/client";
import { checkAndUpdatePostCount } from "../lib/checkPostLimit.js"
import { sendToUser } from "../lib/ws.js";

// ─── Paste these updated functions into your existing feedback.service.js ─────

export const createFeedback = async (data, userId) => {
    const response = await checkAndUpdatePostCount(userId)
    if (!response.allowed) {
        throw new AppError(response.message, 429)
    }

    const newFeedback = await prisma.feedback.create({
        data: {
            userId,
            title: data.title,
            feedback: data.feedback,
            isSpam: data.isSpam,
            // star is stored as Float? in schema — null if not provided
            star: data.star ?? null,
            ...(data.categoryId && { categoryId: Number(data.categoryId) }),
            other: data.other ?? null,
            media: {
                create:
                    data.media?.map((m) => ({
                        url: m.url,
                        name: m.name ?? null,
                        fileSize: m.size ?? null,
                        fileType: m.type ?? null,
                        isAI: m.isAI,
                        type: m.type?.startsWith("image")
                            ? "photo"
                            : m.type?.startsWith("video")
                                ? "video"
                                : "file",
                    })) || [],
            },
        },
        include: { user: true },
    })

    const url = `${baseUrl}/feedback/${newFeedback.id}`;
    const message = `${newFeedback.user.fullname} has submitted feedback.`;
    const users = await prisma.user.findMany({
        where: { type: { in: [UserType.barangay_official, UserType.admin] } },
    });

    await Promise.all(
        users.map((u) => {
            prisma.notification.create({
                data: { url, message, type: "feedback", userId: u.id },
            });
            sendToUser(u.id, {
                type: "NEW_NOTIFICATION",
                notification: { url, message, type: "feedback", userId: u.id },
            });
        })
    );

    return newFeedback;
}

// ─── Updated updateFeedbackById — now accepts star ────────────────────────────

export const updateFeedbackById = async (feedbackId, userId, data) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
    })
    if (!user) throw new AppError("User not found.", 404)

    const existing = await prisma.feedback.findUnique({
        where: { id: feedbackId },
        select: { userId: true },
    })
    if (!existing) throw new AppError("Feedback not found.", 404)

    // Only owner or admin/official can update
    if (user.type === "resident" && user.id !== existing.userId) {
        throw new AppError("Not allowed.", 403)
    }

    // Validate star if provided
    if (data.star !== undefined && data.star !== null) {
        const s = Number(data.star)
        if (!Number.isInteger(s) || s < 1 || s > 5) {
            throw new AppError("Star rating must be between 1 and 5.", 400)
        }
    }

    const updated = await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.feedback !== undefined && { feedback: data.feedback }),
            ...(data.star !== undefined && { star: data.star }),
        },
    })

    return updated
}

export const getFeedbackById = async (id, userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            type: true
        }
    })
    if (!user) {
        throw new AppError("User not found.", 404)
    }
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: id
        },

        select: {
            id: true,
            title: true,
            feedback: true,
            issuedAt: true,
            media: true,
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    contactNumber: true
                }
            }
        }
    })
    if (!feedback) throw new AppError("Feedback not found.", 404)
    if (user.type === "barangay_official" || user.type === "admin") return feedback

    if (user.type === "resident" && user.id === feedback.user.id) return feedback
    throw new AppError("Not allowed.", 400)
}

export const getFeedbackByUserOrAll = async (me, userId = 0, spam, cursor, take = 20) => {
    if (me === "true") {
        const results = await prisma.feedback.findMany({
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor, }, skip: 1 } : {}),
            where: {
                user: {
                    id: userId
                }
            },
            select: {
                id: true,
                title: true,
                issuedAt: true,
            },
            orderBy: {
                issuedAt: 'desc'
            }
        })

        const hasNextPage = results.length > take;
        const data = hasNextPage ? results.slice(0, take) : results;
        const nextCursor = hasNextPage ? data[data.length - 1].id : null;
        return { data, nextCursor, hasNextPage }
    }

    const results = await prisma.feedback.findMany({
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor, }, skip: 1 } : {}),
        ...(spam !== undefined && {
            where: {
                isSpam: spam
            }
        }),
        orderBy: {
            issuedAt: 'desc'
        },
        select: {
            id: true,
            isSpam: true,
            title: true,
            issuedAt: true,
        },
    })

    const hasNextPage = results.length > take;
    const data = hasNextPage ? results.slice(0, take) : results;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;
    return { data, nextCursor, hasNextPage }
}

export const updateFeedbackStatus = async (feedbackId, title, feedback) => {
    await prisma.feedback.update({
        where: {
            id: feedbackId
        },
        data: {
            title: title,
            feedback: feedback
        }
    })
    return
}

export const deleteFeedback = async (feedbackId, userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!feedback) {
        throw new AppError("Feedback not found", 404);
    }

    // Barangay officials can delete any feedback
    if (user.type === "barangay_official") {
        return prisma.feedback.delete({
            where: { id: feedbackId },
        });
    }

    // Residents can only delete their own
    if (user.type === "resident" && feedback.userId === user.id) {
        return prisma.feedback.delete({
            where: { id: feedbackId },
        });
    }

    throw new AppError("Not allowed", 403);
};


// ─── Add this to your existing feedback.service.js ───────────────────────────

/**
 * Returns up to 9 non-spam feedbacks that have a star rating > 0.
 * Only exposes safe public fields — no email, phone, or contact info.
 */
export const getPublicFeedbacks = async () => {
  const feedbacks = await prisma.feedback.findMany({
    where: {
      isSpam: false,
      star: { gt: 0 },
    },
    orderBy: { issuedAt: "desc" },
    take: 9,
    select: {
      id: true,
      title: true,
      feedback: true,
      star: true,
      issuedAt: true,
      category: {
        select: { name: true },
      },
      user: {
        select: {
          // Only the first name initial — no full name, no contact info
          fullname: true,
          position: true,
        },
      },
    },
  })

  // Mask full name to "M. Santos" style before returning
  return feedbacks.map((f) => ({
    id: f.id,
    title: f.title,
    feedback: f.feedback,
    star: f.star,
    issuedAt: f.issuedAt,
    category: f.category?.name ?? null,
    // "Maria Santos" → "Maria S."
    displayName: f.user?.fullname
      ? (() => {
          const parts = f.user.fullname.trim().split(" ")
          if (parts.length === 1) return parts[0]
          const last = parts[parts.length - 1]
          return `${parts[0]} ${last.charAt(0)}.`
        })()
      : "Anonymous",
    position: f.user?.position ?? "Community Resident",
  }))
}