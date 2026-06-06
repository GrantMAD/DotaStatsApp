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
  return await fetchFromOpenDota<HeroStats[]>(`/heroStats`);
}

/**
 * Fetches matchups for a specific hero.
 */
export async function getHeroMatchups(heroId: number): Promise<HeroMatchup[]> {
  return await fetchFromOpenDota<HeroMatchup[]>(`/heroes/${heroId}/matchups`);
}

/**
 * Fetches win rate by match duration for a specific hero.
 */
export async function getHeroDurations(heroId: number): Promise<HeroDuration[]> {
  return await fetchFromOpenDota<HeroDuration[]>(`/heroes/${heroId}/durations`);
}

/**
 * Fetches item popularity for a specific hero.
 */
export async function getHeroItemPopularity(heroId: number): Promise<HeroItemPopularity> {
  return await fetchFromOpenDota<HeroItemPopularity>(`/heroes/${heroId}/itemPopularity`);
}

/**
 * Fetches item timing scenarios.
 */
export async function getScenariosItemTimings(params: { item?: string; hero_id?: number }): Promise<ItemTimingScenario[]> {
  const query = new URLSearchParams();
  if (params.item) query.append('item', params.item);
  if (params.hero_id) query.append('hero_id', params.hero_id.toString());
  const data: any = await fetchFromOpenDota(`/scenarios/itemTimings?${query.toString()}`);
  return Array.isArray(data) ? data : (data.value || []);
}

/**
 * Fetches lane role scenarios.
 */
export async function getScenariosLaneRoles(params: { lane_role?: number; hero_id?: number }): Promise<LaneRoleScenario[]> {
  const query = new URLSearchParams();
  if (params.lane_role) query.append('lane_role', params.lane_role.toString());
  if (params.hero_id) query.append('hero_id', params.hero_id.toString());
  const data: any = await fetchFromOpenDota(`/scenarios/laneRoles?${query.toString()}`);
  return Array.isArray(data) ? data : (data.value || []);
}

/**
 * Fetches MMR distribution data.
 */
export async function getDistributions(): Promise<DistributionData> {
  return await fetchFromOpenDota<DistributionData>(`/distributions`);
}

/**
 * Fetches miscellaneous scenarios.
 */
export async function getScenariosMisc(params: { scenario?: string }): Promise<MiscScenario[]> {
  const query = new URLSearchParams();
  if (params.scenario) query.append('scenario', params.scenario);
  const data = await fetchFromOpenDota<MiscScenario[]>(`/scenarios/misc?${query.toString()}`);
  return Array.isArray(data) ? data : [];
}
