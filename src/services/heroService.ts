import { fetchFromOpenDota } from './apiUtils';
import { 
  HeroStats, 
  HeroMatchup, 
  HeroDuration, 
  HeroItemPopularity,
  ItemTimingScenario,
  LaneRoleScenario,
  DistributionData,
  MiscScenario
} from './types';

/**
 * Fetches global hero stats including pick/win rates across all brackets.
 */
export async function getHeroStats(): Promise<HeroStats[]> {
  try {
    return await fetchFromOpenDota<HeroStats[]>(`/heroStats`);
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    return [];
  }
}

/**
 * Fetches matchups for a specific hero.
 */
export async function getHeroMatchups(heroId: number): Promise<HeroMatchup[]> {
  try {
    return await fetchFromOpenDota<HeroMatchup[]>(`/heroes/${heroId}/matchups`);
  } catch (error) {
    console.error('Error fetching hero matchups:', error);
    return [];
  }
}

/**
 * Fetches win rate by match duration for a specific hero.
 */
export async function getHeroDurations(heroId: number): Promise<HeroDuration[]> {
  try {
    return await fetchFromOpenDota<HeroDuration[]>(`/heroes/${heroId}/durations`);
  } catch (error) {
    console.error('Error fetching hero durations:', error);
    return [];
  }
}

/**
 * Fetches item popularity for a specific hero.
 */
export async function getHeroItemPopularity(heroId: number): Promise<HeroItemPopularity | null> {
  try {
    return await fetchFromOpenDota<HeroItemPopularity>(`/heroes/${heroId}/itemPopularity`);
  } catch (error) {
    console.error('Error fetching hero item popularity:', error);
    return null;
  }
}

/**
 * Fetches item timing scenarios.
 */
export async function getScenariosItemTimings(params: { item?: string; hero_id?: number }): Promise<ItemTimingScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.item) query.append('item', params.item);
    if (params.hero_id) query.append('hero_id', params.hero_id.toString());
    const data: any = await fetchFromOpenDota(`/scenarios/itemTimings?${query.toString()}`);
    return Array.isArray(data) ? data : (data.value || []);
  } catch (error) {
    console.error('Error fetching item timing scenarios:', error);
    return [];
  }
}

/**
 * Fetches lane role scenarios.
 */
export async function getScenariosLaneRoles(params: { lane_role?: number; hero_id?: number }): Promise<LaneRoleScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.lane_role) query.append('lane_role', params.lane_role.toString());
    if (params.hero_id) query.append('hero_id', params.hero_id.toString());
    const data: any = await fetchFromOpenDota(`/scenarios/laneRoles?${query.toString()}`);
    return Array.isArray(data) ? data : (data.value || []);
  } catch (error) {
    console.error('Error fetching lane role scenarios:', error);
    return [];
  }
}

/**
 * Fetches MMR distribution data.
 */
export async function getDistributions(): Promise<DistributionData | null> {
  try {
    return await fetchFromOpenDota<DistributionData>(`/distributions`);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return null;
  }
}

/**
 * Fetches miscellaneous scenarios.
 */
export async function getScenariosMisc(params: { scenario?: string }): Promise<MiscScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.scenario) query.append('scenario', params.scenario);
    const data = await fetchFromOpenDota<MiscScenario[]>(`/scenarios/misc?${query.toString()}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching misc scenarios:', error);
    return [];
  }
}
