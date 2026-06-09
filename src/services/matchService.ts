import { fetchFromOpenDota } from './apiUtils';
import { MatchDetails, LiveGame, GlobalRecord } from './types';

/**
 * Fetches detailed statistics for a specific match.
 */
export async function getMatchDetails(matchId: number): Promise<MatchDetails> {
  return await fetchFromOpenDota<MatchDetails>(`/matches/${matchId}`);
}

/**
 * Submits a request to parse a specific match.
 */
export async function requestMatchParse(matchId: number): Promise<{ job: { jobId: string } }> {
  return await fetchFromOpenDota<{ job: { jobId: string } }>(`/request/${matchId}`, {
    method: 'POST'
  });
}

/**
 * Checks the status of a parse job.
 */
export async function getParseStatus(jobId: string): Promise<any> {
  return await fetchFromOpenDota<any>(`/request/${jobId}`);
}

/**
 * Fetches current live games.
 */
export async function getLiveGames(): Promise<LiveGame[]> {
  const data = await fetchFromOpenDota<LiveGame[]>(`/live`);
  // Sort by MMR and return top high-level games
  return data
    .filter((g: any) => g.average_mmr > 0)
    .sort((a: any, b: any) => b.average_mmr - a.average_mmr)
    .slice(0, 10);
}

/**
 * Fetches global records for a specific field.
 */
export async function getGlobalRecords(field: string): Promise<GlobalRecord[]> {
  const data = await fetchFromOpenDota<GlobalRecord[]>(`/records/${field}`);
  return data.slice(0, 5);
}
