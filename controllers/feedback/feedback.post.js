import * as feedbackService from "../../services/feedback.service.js";

export const createFeedback = async (req, res) => {
  const { title, isSpam, feedback, media = [], categoryId, other, star } = req.body;
  const spam = isSpam === "true" || isSpam === true;

  if (!title || !feedback) {
    return res.status(400).json({
      error: "Title and Feedback fields are required",
    });
  }

  // star must be 1–5 if provided
  if (star !== undefined) {
    const starNum = Number(star);
    if (!Number.isInteger(starNum) || starNum < 1 || starNum > 5) {
      return res.status(400).json({ error: "Star rating must be between 1 and 5" });
    }
  }

  const userId = req.user?.userId;
  try {
    await feedbackService.createFeedback(
      { title, feedback, media, isSpam: spam, categoryId, other, star: star ? Number(star) : null },
      parseInt(userId)
    );
    return res.status(201).json({ message: "Your feedback has been filed." });
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

// ─── Drop-in replacement for updateFeedbackById in feedback.controller.js ─────

export const updateFeedbackById = async (req, res) => {
  const { id } = req.params;
  const { title, feedback, star } = req.body;
  const userId = req.user?.userId;

  if (!title && !feedback && star === undefined) {
    return res.status(400).json({
      error: "At least one field (title, feedback, or star) must be provided",
    });
  }

  // Guard star value on the controller level too
  if (star !== undefined) {
    const s = Number(star);
    if (!Number.isInteger(s) || s < 1 || s > 5) {
      return res.status(400).json({ error: "Star rating must be between 1 and 5" });
    }
  }

  try {
    const updatedFeedback = await feedbackService.updateFeedbackById(
      Number(id),
      Number(userId),
      { title, feedback, star: star !== undefined ? Number(star) : undefined }
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