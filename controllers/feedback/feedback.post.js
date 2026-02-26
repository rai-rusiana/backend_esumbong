import * as feedbackService from "../../services/feedback.service.js";

export const createFeedback = async (req, res) => {
  const { title, feedback, media = [] } = req.body;

  if (!title || !feedback) {
    return res.status(400).json({
      error: "Title and Feedback fields are required",
    });
  }
  
  const userId = req.user?.userId;
  try {
    await feedbackService.createFeedback(
      { title, feedback, media },
      parseInt(userId)
    );
    return res.status(201).json({
      message: "Your feedback has been filed.",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating feedback:", error);
    }
    return res.status(500).json({
      error: "An error occurred while filing the feedback.",
    });
  }
};


export const deleteFeedback = async (req, res) => {
  const { id } = req.params
  const userId = req.user?.userId
  try {
    await feedbackService.deleteFeedback(Number(id), Number(userId))
    return res.status(200).json({
      ok: true,
      message: "Successfully deleted the feedback",
    });
  } catch (error) {
    if (error.name === "AppError") return res.status(error.status).json({ error: error.message })

    if (process.env.NODE_ENV === "development") {
      console.error("Error upon deleting feedback.")
    }
    return res.status(500).json({
      error: "An error occurred while deleting the feedback.",
    })
  }
}
export const updateFeedbackById = async (req, res) => {
  const { id } = req.params;
  const { title, feedback } = req.body;
  const userId = req.user?.userId;

  if (!title && !feedback) {
    return res.status(400).json({
      error: "At least one field (title or feedback) must be provided",
    });
  }

  try {
    const updatedFeedback = await feedbackService.updateFeedbackById(
      Number(id),
      Number(userId),
      { title, feedback } 
    );

    return res.status(200).json({
      ok: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    if (error.name === "AppError") {
      return res.status(error.status).json({ error: error.message });
    }

    if (process.env.NODE_ENV === "development") {
      console.error("Error updating feedback:", error);
    }

    return res.status(500).json({
      error: "An error occurred while updating the feedback",
    });
  }
};
