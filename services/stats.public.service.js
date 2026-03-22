import prisma from "../lib/prisma.js"

/**
 * Returns public-facing stats:
 * - totalResidents: number of verified resident accounts
 * - totalConcerns: number of non-anonymous, non-archived concerns
 * - averageStar: average feedback star rating (excluding spam, nulls, and zeros)
 */
export const getPublicStats = async () => {
    const [totalResidents, totalConcerns, starAggregate] = await Promise.all([
        prisma.user.count({
            where: {
                type: "resident",
                isVerified: true,
                isActive: true,
            },
        }),

        prisma.concern.count({
            where: {
                isAnonymous: false,
                isArchived: false,
            },
        }),

        prisma.feedback.aggregate({
            _avg: { star: true },
            where: {
                isSpam: false,
                star: { gt: 0 },
            },
        }),
    ])

    const averageStar = starAggregate._avg.star
        ? Math.round(starAggregate._avg.star * 10) / 10
        : null

    return { totalResidents, totalConcerns, averageStar }
}