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
