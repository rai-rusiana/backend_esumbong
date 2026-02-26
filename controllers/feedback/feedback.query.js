
import * as feedbackService from "../../services/feedback.service.js"

export const getFeedbackByUserOrAll = async (req, res) => {
    const { me } = req.query
    let userId;
    if (me === "true") {
        userId = Number(req.user?.userId)
    }
    try {
        const feedbacks = await feedbackService.getFeedbackByUserOrAll(me, userId)
        console.log("Feedbacks", feedbacks)
        return res.status(200).json(feedbacks)
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error getting feedback:", error);
        }
        return res.status(500).json({
            error: "An error occurred while fetching feedback."
        })
    }
}

export const getFeedbackById = async (req, res) => {
    const { id } = req.params
    const userId = req.user?.userId
    try {
        const feedback = await feedbackService.getFeedbackById(Number(id), Number(userId))
        if (process.env.NODE_ENV === "development") {
            console.log("Feedbackby Id:", feedback)
        }
        if (!feedback) {
            return res.status(404).json({
                error: "Feedback not found"
            })
        }
        return res.status(200).json(feedback)
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error getting feedback by id:", id, error)
        }
        if (error.name === "AppError") {
            return res.status(error.status).json({ error: error.message })
        }
        return res.status(500).json({
            error: "An error occurred while fetching the feedback."
        })
    }
}