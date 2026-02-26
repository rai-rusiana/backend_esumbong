import * as announceService from "../../services/announcement.service.js"

export const createAnnouncement = async (req, res) => {
    const { title, content, notifyResidents, notifyOfficials } = req.body
    const userId = req.user.userId
    const parseBool = (val) => val === true || val === "true";

    const notifyResidentsBool = parseBool(notifyResidents);
    const notifyOfficialsBool = parseBool(notifyOfficials);
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" })
    }

    try {
        await announceService.createAnnouncement({ title, content, notifyResidents: notifyResidentsBool, notifyOfficials: notifyOfficialsBool }, parseInt(userId))
        return res.status(201).json({ message: "Announcement created successfully" })
    } catch (error) {
        console.error("Error creating announcement:", error)
        return res.status(500).json({ error: "An error occurred while creating the announcement." })
    }
}

export const updateAnnouncement = async (req, res) => {
    const { id } = req.params
    const { title, content } = req.body
    const userId = req.user.userId
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" })
    }

    try {
        await announceService.updateAnnouncement({ title, content }, parseInt(id), parseInt(userId))
        return res.status(201).json({ message: "Announcement updated successfully" })
    } catch (error) {
        console.error("Error updating announcement:", error)
        return res.status(500).json({ error: "An error occurred while updating the announcement." })
    }
}

export const deleteAnnouncement = async (req, res) => {
    const { id } = req.params
    try {
        await announceService.deleteAnnouncement(parseInt(id))
        return res.status(200).json({ message: "Announcement deleted successfully" })
    } catch (error) {
        console.error("Error deleting announcement:", error)
        return res.status(500).json({ error: "An error occurred while deleting the announcement." })

    }
}