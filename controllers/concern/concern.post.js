import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const {
    title,
    details,
    needsBarangayAssistance,
    categoryId,
    other,
    location,
    media
  } = req.body;


  /* ───────────── Validation ───────────── */
  if (!title || !details || !location) {
    return res.status(400).json({
      error: "Title, Details, and Location fields are required",
    });
  }

  if (!categoryId && !other) {
    return res.status(400).json({
      message: "You must specify a category or provide an 'other' value.",
    });
  }

  if (categoryId && other) {
    return res.status(400).json({
      message: "You cannot set both a category and 'other'.",
    });
  }

  /* ───────────── Normalize values ───────────── */
  const userId = Number(req.user?.userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsedCategoryId = categoryId ? Number(categoryId) : null;

  /* ───────────── Create concern ───────────── */
  try {
    await concernService.createConcern(
      {
        title,
        details,
        needsBarangayAssistance: Boolean(needsBarangayAssistance),
        location,
        other: other || null,
        media, // ✅ metadata array
      },
      parsedCategoryId,
      userId,
    );

    return res.status(200).json({
      message: "Your concern has been filed.",
    });
  } catch (error) {

    if (process.env.NODE_ENV === "development") console.error("Error creating concern:", error);
    return res.status(500).json({
      error: "An error occurred while creating the concern.",
    });
  }
};


export const updateConcernStatus = async (req, res) => {

  const { concernId } = req.params
  const { status, updateMessage } = req.body
  const userId = req.user?.userId
  if (!status) {
    return res.status(400).json({
      error: "Status field is required."
    })
  }
  try {
    await concernService.updateStatusConcern(
      parseInt(userId),
      parseInt(concernId),
      { status, updateMessage }
    )
    return res.status(200).json({
      message: "Concern status has been updated."
    })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating concern status: ", error)
    }
    return res.status(500).json({
      error: "An error occurred upon updating the concern. "
    })
  }
}

export const validateConcern = async (req, res) => {
  const { id } = req.params;
  const { validation } = req.body
  const { type } = req.query
  const userId = req.user?.userId

  try {
    await concernService.validateConcern(parseInt(id), validation, parseInt(userId), type);
    return res.status(200).json({ message: "Successfully validated the concern" })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon validating concern:", error)
    }
    return res.status(500).json({
      error: "An internal server error has occurred.",
    })
  }
}

export const archiveConcern = async (req, res) => {
  const { id } = req.params
  const userId = req.user?.userId
  try {
    await concernService.archiveConcern(parseInt(id), parseInt(userId))

    return res.status(200).json({ message: "Successfully archived the concern" })
  } catch (error) {

    if (process.env.NODE_ENV === "development") {
      console.error("Error upon archiving the concern", error)
    }
    return res.status(500).json({
      error: "An internal server error has occured while archiving concern"
    })
  }
}

export const deleteConcern = async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId
  try {
    await concernService.deleteConcern(parseInt(id), parseInt(userId))
    return res.status(200).json({ message: "Successfully deleted the concern" })
  } catch (error) {

    if (process.env.NODE_ENV === "development") {
      console.error("Error upon deleting concern:", error)
    }
    return res.status(500).json({
      error: "An internal server error has occured while deleting Concern"
    })
  }
}

export const userConcernMessage = async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId
  const { media, message } = req.body
  try {
    await concernService.userConcernMessage(Number(userId), Number(id), { media, message })
    return res.status(201).json({
      message: "Message Sent"
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon sending messages regarding the concern:", error)
    }
    return res.status(500).json({
      error: "An internal server error has occured while sending messages to the Concern"
    })
  }
}

export const getConcernMessages = async (req, res) => {

}

export const deleteConcernMessage = async (req, res) => {

  const { id } = req.params
  try {
    await concernService.deleteConcernMessage()
    return res.json(200).json({
      message: "Message deleted"
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon deleting messages regarding the concern:", error)
    }
    if (error.name === "AppError") {
      return res.status(error.statusCode).json({
        error: error.message
      })
    }
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon sending messages regarding the concern:", error)
    }
  }
}