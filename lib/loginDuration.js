// utils/lockConfig.ts
export function getLockDuration(loginAttempts) {
    const tier = loginAttempts / 3; // 1, 2, 3, 4, 5, 6+

    const durations = {
        1: 30,          // 30 seconds
        2: 30,          // 30 seconds  (attempts 3 and 6 both get 30s based on your spec)
        3: 120,         // 2 minutes
        4: 600,
        5: 1800,        // 30 minutes
        6: 3600,        // 1 hour
    };

    if (tier <= 5) return durations[tier] ?? null;

    // tier > 5: each extra tier adds 1 hour
    const extraHours = tier - 5;
    return 3600 * (1 + extraHours);
}