import * as announcementService from "../../services/announcement.service.js"


export const getAllAnnouncements = async (req, res) => {
    const userId = req.user?.userId
    const { sidebar } = req.query
    const isSidebar = sidebar === "true" ? true : false
    try {
        const announcements = await announcementService.getAllAnnouncements(parseInt(userId), isSidebar)

        return res.status(200).json(announcements)
    } catch (error) {
        console.error("Error fetching announcements:", error)
        return res.status(500).json({ error: "An error occurred while fetching announcements." })
    }
}

export const getAnnouncementById = async (req, res) => {
    const { id } = req.params
    const userId = req.user?.userId
    try {
        const announcement = await announcementService.getAnnouncementById(parseInt(id), parseInt(userId))
        if (!announcement) {
            res.status(404).json({ error: "Announcement not found" })
        }
        return res.status(200).json(announcement)
    } catch (error) {
        if (process.env.NODE_ENV === "development") {

            console.error(`Error fetching announcement:${id}`, error)
        }
        if (error.name === "AppError") {
            return res.status(error.status).json({ error: error.message })
        }
        return res.status(500).json({ error: "An error occurred while fetching the announcement." })
    }
}