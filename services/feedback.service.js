import { AppError } from "../lib/error.js";
import prisma from "../lib/prisma.js"
const baseUrl = process.env.FRONTEND_URL;
import { UserType } from "@prisma/client";
import { checkAndUpdatePostCount } from "../lib/checkPostLimit.js"
import { sendToUser } from "../lib/ws.js";

export const createFeedback = async (data, userId) => {
    const response = await checkAndUpdatePostCount(userId)
    if (!response.allowed) {
        throw new AppError(response.message, 429)
    }
    const newFeedback = await prisma.feedback.create({
        data: {
            userId: userId,
            title: data.title,
            feedback: data.feedback,
            isSpam: data.isSpam,
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
        include: {
            user: true,
        },
    })
    const url = `${baseUrl}/feedback/${newFeedback.id}`;
    const message = `${newFeedback.user.fullname} has a feedback.`;
    console.log("finding users")
    const users = await prisma.user.findMany({
        where: {
            type: {
                in: [UserType.barangay_official, UserType.admin],
            },
        },
    });


    await Promise.all(
        users.map((u) => {
            prisma.notification.create({
                data: {
                    url,
                    message,
                    type: "feedback",
                    userId: u.id,
                },
            });

            sendToUser(u.id, {
                type: "NEW_NOTIFICATION",
                notification: { url, message, type: "concern", userId: u.id }
            })
        })

    );
    return newFeedback;
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

export const getFeedbackByUserOrAll = async (me, userId = 0) => {
    if (me === "true") {
        return await prisma.feedback.findMany({
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
    }

    return await prisma.feedback.findMany({
        orderBy: {
            issuedAt: 'desc'

        },
        select: {
            id: true,
            title: true,
            issuedAt: true,
        },
    })
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



export const updateFeedbackById = async (feedbackId, userId, data) => {
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

    // ❗ Only owner can update
    if (feedback.userId !== userId) {
        throw new AppError("You are not allowed to edit this feedback", 403);
    }

    return prisma.feedback.update({
        where: { id: feedbackId },
        data: {
            title: data.title,
            feedback: data.feedback,
        },
    });
};
