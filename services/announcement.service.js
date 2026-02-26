
import { AppError } from "../lib/error.js";
import prisma from "../lib/prisma.js"
const baseUrl = process.env.FRONTEND_URL;

export const createAnnouncement = async (data, userId) => {
    const newAnnouncement = await prisma.announcement.create({
        data: {
            title: data.title,
            content: data.content,
            userId: userId,
            notifyResidents: data.notifyResidents,
            notifyOfficials: data.notifyOfficials,
        }
    })
    const message = `New announcement posted: ${data.title}`
    const url = `${baseUrl}/announcements/${newAnnouncement.id}`;
    const officials = await prisma.user.findMany({
        where: { type: "barangay_official" }
    })
    const residents = await prisma.user.findMany({
        where: { type: "resident" }
    })
    if (data.notifyResidents === true) {
        await Promise.all(residents.map(async (resident) => {
            await prisma.notification.create({
                data: {
                    url,
                    type: "announcement",
                    message,
                    userId: resident.id
                }
            })
        }))
    }

    if (data.notifyOfficials === true) {
        await Promise.all(officials.map(async (user) => {
            await prisma.notification.create({
                data: {
                    url,
                    type: "announcement",
                    message,
                    userId: user.id
                }
            })
        }))
    }
}




export const updateAnnouncement = async (data, id, userId) => {

    await prisma.announcement.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            notifyResidents: data.notifyResidents,
            notifyOfficials: data.notifyOfficials,
            userId: userId,
            updatedAt: new Date()
        }
    })
}

export const deleteAnnouncement = async (id) => {
    await prisma.announcement.delete({
        where: { id }
    })
}
export const getAnnouncementById = async (id, userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { type: true }
    })
    if (!user) throw new Error("User not found");
    const announcement = await prisma.announcement.findUnique({
        where: { id }
    })
    if (!announcement) {
        throw new AppError("Announcement not found", 404);
    }
    if (
        (user.type === "resident" && !announcement.notifyResidents) ||
        (user.type === "official" && !announcement.notifyOfficials)
    ) {
        throw new AppError("Announcement not accessible by this user", 403)
    }
    return announcement
}

export const getAllAnnouncements = async (userId, sidebar = false) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { type: true },
    });


    if (!user) throw new Error("User not found");

    const whereClause = user.type === "resident"
        ? { notifyResidents: true }
        : { notifyOfficials: true };


    const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: sidebar ? 5 : undefined,
        where: whereClause,
    });

    return announcements;
};
