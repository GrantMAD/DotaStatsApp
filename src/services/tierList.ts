import { HeroStats } from './opendota';

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TierHero {
  id: number;
  name: string;
  img: string;
  winRate: number;
  pickRate: number;
  picks: number;
  tier: Tier;
}

export const BRACKET_NAMES: Record<number, string> = {
  1: 'Herald',
  2: 'Guardian',
  3: 'Crusader',
  4: 'Archon',
  5: 'Legend',
  6: 'Ancient',
  7: 'Divine',
  8: 'Immortal',
};

/**
 * Calculates a tier list for a specific rank bracket.
 * Tiers are determined by a combination of win rate and pick rate.
 */
export function calculateTierList(heroes: HeroStats[], bracket: number): TierHero[] {
  if (!heroes || heroes.length === 0) return [];

  const pickField = `${bracket}_pick` as keyof HeroStats;
  const winField = `${bracket}_win` as keyof HeroStats;

  // Calculate total picks in this bracket to determine pick rate %
  let totalPicksInBracket = 0;
  heroes.forEach(h => {
    totalPicksInBracket += (h[pickField] as number) || 0;
  });

  // Total matches is roughly total picks / 10
  const totalMatches = totalPicksInBracket / 10;

  const processed: TierHero[] = heroes
    .filter(h => (h[pickField] as number) > 500) // Minimum threshold for reliable stats
    .map(h => {
      const picks = (h[pickField] as number) || 0;
      const wins = (h[winField] as number) || 0;
      const winRate = (wins / picks) * 100;
      const pickRate = (picks / totalMatches) * 100;

      // Tier logic (customizable):
      // S: WR > 52.5% AND PR > 10% (Dominant meta)
      // A: WR > 51% OR (WR > 50% AND PR > 15%)
      // B: WR > 49%
      // C: WR > 47%
      // D: WR <= 47%
      
      let tier: Tier = 'D';
      if (winRate >= 52.5 && pickRate >= 8) {
        tier = 'S';
      } else if (winRate >= 51 || (winRate >= 50 && pickRate >= 12)) {
        tier = 'A';
      } else if (winRate >= 49) {
        tier = 'B';
      } else if (winRate >= 47) {
        tier = 'C';
      }

      return {
        id: h.id,
        name: h.localized_name,
        img: h.img,
        winRate,
        pickRate,
        picks,
        tier,
      };
    });

  return processed.sort((a, b) => {
    const tierOrder: Record<Tier, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[a.tier] - tierOrder[b.tier];
    }
    return b.winRate - a.winRate;
  });
}

/**
 * Gets the bracket index (1-8) from a rank_tier value.
 */
export function getBracketFromRankTier(rankTier: number | null | undefined): number {
  if (!rankTier) return 4; // Default to Archon
  const bracket = Math.floor(rankTier / 10);
  if (bracket < 1) return 1;
  if (bracket > 8) return 8;
  return bracket;
}
