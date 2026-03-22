import * as concernService from "../../services/concern.service.js";

export const getConcernById = async (req, res) => {
  const { id } = req.params;
  const concernId = parseInt(id)
  if (!concernId) {
    return res.status(400).json({ error: "Invalid or missisng concern id hellow" });
  }
  try {
    const concern = await concernService.getConcernById(concernId);
    if (!concern) {
      return res.status(404).json({ error: "Concern not found" });
    }
    return res.status(200).json({ data: concern, message: "Concern fetched successfully" });

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting concern:", error);
    }
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the concern." });
  }
};

export const getConcernStats = async (req, res) => {
  const userId = req.user.userId
  const { official } = req.query
  const isOfficial = official === "true" ? true : official === "false" ? false : undefined
  try {
    const stats = await concernService.getConcernStats(Number(userId), isOfficial)
    return res.status(200).json(stats)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting concern stats:", error);
    }
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the concern stats." });
  }
}

export const getConcernUpdatesById = async (req, res) => {
  const { id } = req.params
  try {
    const updates = await concernService.getConcernUpdatesById(parseInt(id))
    return res.status(200).json({
      data: updates,
      message: "concern updates fetched successfully"
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting concern:", error);
    }
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the concern." });
  }
}

export const getAllConcern = async (req, res) => {
  const { search, status, archived, validation, recent, spam, cursor } = req.query
  const recentFilter = recent === "true" ? true : recent === "false" ? false : undefined
  const archivedFilter = archived === "true" ? true : archived === "false" ? false : undefined
  const validationFilter = validation === "true" ? true : validation === "false" ? false : undefined
  const isSpam = spam === "true" ? true : spam === "false" ? false : undefined
  try {
    const result = await concernService.getAllConcerns({
      search, status,
      archived: archivedFilter,
      validation: validationFilter,
      recent: recentFilter,
      spam: isSpam,
      cursor: cursor ? parseInt(cursor) : undefined, // or keep as string if id is a string
    });

    return res.status(200).json(result);
  } catch (error) {

    if (process.env.NODE_ENV === "development") {
      console.error("Error getting all the concerns:", error);
    }
    return res
      .status(500)
      .json({ error: "An error occurred while fetching all the concern." });
  }
}

export const getConcernsByUserId = async (req, res) => {
  const userId = Number(req.user?.userId)
  const { cursor } = req.query
  try {
    const result = await concernService.getResidentConcerns(userId, cursor ? parseInt(cursor) : undefined)
    return res.status(200).json(result)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upun getting concerns by userID:", error)
    }
    if (error.name === "AppError") {
      return res.status(error.statusCode).json({
        error: error.message
      })
    }
    return res.status(500).json({
      error: "Unexpected server error has occured."
    })
  }
}

export const getConcernHistory = async (req, res) => {
  const userId = Number(req.user?.userId)
  const { cursor } = req.query
  
  try {
    const results = await concernService.getUpdatedConcerns(userId, cursor ? parseInt(cursor) : undefined)
    return res.status(200).json(results)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon getting concern history:", error)
    }
    return res.status(500).json({
      error: "Unexpected server error has occured."
    })
  }
}