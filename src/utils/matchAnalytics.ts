/**
 * Calculates a letter grade based on laning efficiency and benchmarks.
 * @param efficiency Laning efficiency percentage (0-100)
 * @param percentile LHTEN percentile (0-1)
 */
export function calculateLaningGrade(efficiency: number | null, percentile: number | null) {
  if (efficiency === null && percentile === null) return null;

  // Weighted score: 60% efficiency, 40% percentile (converted to 0-100)
  const effScore = efficiency || 0;
  const percScore = (percentile || 0) * 100;
  
  let score = 0;
  if (efficiency !== null && percentile !== undefined && percentile !== null) {
    score = (effScore * 0.6) + (percScore * 0.4);
  } else {
    score = effScore || percScore;
  }

  if (score >= 95) return { grade: 'A+', color: '#34d399', label: 'Immortal' };
  if (score >= 85) return { grade: 'A', color: '#10b981', label: 'Divine' };
  if (score >= 75) return { grade: 'B+', color: '#60a5fa', label: 'Ancient' };
  if (score >= 65) return { grade: 'B', color: '#3b82f6', label: 'Legend' };
  if (score >= 50) return { grade: 'C+', color: '#f59e0b', label: 'Archon' };
  if (score >= 40) return { grade: 'C', color: '#f97316', label: 'Crusader' };
  if (score >= 25) return { grade: 'D', color: '#ef4444', label: 'Guardian' };
  return { grade: 'F', color: '#b91c1c', label: 'Herald' };
}

/**
 * Normalizes a draft advantage score into a percentage for Radiant.
 * @param matchups Array of matchup objects for all Radiant heroes against Dire heroes
 * @param radiantPicks Array of Radiant hero IDs
 * @param direPicks Array of Dire hero IDs
 */
export function calculateDraftAdvantage(matchups: any[], radiantPicks: number[], direPicks: number[]) {
  if (!matchups || matchups.length === 0 || radiantPicks.length === 0 || direPicks.length === 0) {
    return 50;
  }

  let totalWinRateDiff = 0;
  let count = 0;

  // Each Radiant hero vs every Dire hero
  radiantPicks.forEach(rId => {
    direPicks.forEach(dId => {
      // Find the winrate of Radiant hero (rId) against Dire hero (dId)
      // The matchups parameter is expected to be a map or structured array of hero_id -> matchup_data
      const heroMatchups = matchups.find(m => m.hero_id === rId)?.matchups;
      if (heroMatchups) {
        const vsDire = heroMatchups.find((m: any) => m.hero_id === dId);
        if (vsDire && vsDire.games_played > 0) {
          // Differential: (wins / games) - 0.5
          // e.g., 0.55 winrate = +0.05 advantage
          const winRate = vsDire.wins / vsDire.games_played;
          totalWinRateDiff += (winRate - 0.5);
          count++;
        }
      }
    });
  });

  if (count === 0) return 50;

  // Average the differential and scale it
  // Average differential of 0.05 (5%) across 25 matchups is significant.
  // We'll scale the average differential to a 50 +/- range.
  const avgDiff = totalWinRateDiff / count;
  
  // 5% avg winrate diff -> 10% move on the 50% scale
  const advantage = 50 + (avgDiff * 200);

  // Clamp between 20% and 80% to keep it realistic
  return Math.min(Math.max(advantage, 20), 80);
}
