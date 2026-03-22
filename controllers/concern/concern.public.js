import * as concernService from "../../services/concern.service.js"

// Existing controllers assumed to be in concern.Query.js already
// Adding public controllers below — merge these into your concern.Query.js file

/**
 * GET /api/concern/public/sample
 * No auth required. Returns 1 concern per status (pending, inProgress, resolved).
 * Skips anonymous concerns.
 */
export const getPublicSampleConcerns = async (req, res) => {
  try {
    const concerns = await concernService.getPublicSampleConcerns()
    return res.status(200).json(concerns)
  } catch (error) {
    console.error("Error fetching public sample concerns:", error)
    return res.status(500).json({ error: "An error occurred while fetching concerns." })
  }
}

/**
 * GET /api/concern/public/:id
 * No auth required. Returns a single concern by ID.
 * Returns 404 if anonymous or not found.
 */
export const getPublicConcernById = async (req, res) => {
  const { id } = req.params
  try {
    const concern = await concernService.getPublicConcernById(parseInt(id))
    return res.status(200).json(concern)
  } catch (error) {
    if (error.name === "AppError") {
      return res.status(error.status).json({ error: error.message })
    }
    console.error(`Error fetching public concern ${id}:`, error)
    return res.status(500).json({ error: "An error occurred while fetching the concern." })
  }
}