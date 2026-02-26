import * as summonService from "../../services/summon.service.js"



export const summonResident = async (req, res) => {
    const { id } = req.params
    const { date, residentId, startTime, endTime, files } = req.body
    const userId = req.user.userId
    if (!date || !residentId ||  !startTime ) {
        return res.status(400).json({
            error: "Missing required fields."
        })
    }

    try {
        await summonService.summonResident(
            { date, residentId: parseInt(residentId), startTime, endTime, files },
            parseInt(id),
            parseInt(userId)
        )
        return res.status(200).json({
            message: "Resident has been summoned successfully."
        })
    } catch (error) {
        console.error("Error summoning resident: ", error)
        return res.status(500).json({
            error: "An error occurred while summoning the resident."
        })
    }
}