import * as statsService from "../../services/stats.public.service.js"

/**
 * GET /api/stats/public
 * No auth required. Returns resident count, concern count, avg star rating.
 */
export const getPublicStats = async (req, res) => {
  try {
    const stats = await statsService.getPublicStats()
    return res.status(200).json(stats)
  } catch (error) {
    console.error("Error fetching public stats:", error)
    return res.status(500).json({ error: "Failed to fetch stats." })
  }
}