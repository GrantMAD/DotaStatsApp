export interface PlayerProfile {
  profile: {
    account_id: number;
    personaname: string;
    avatarfull: string;
    profileurl: string;
    loccountrycode: string | null;
    communityvisibilitystate?: number;
  };
  rank_tier: number | null;
  leaderboard_rank: number | null;
  last_match_time?: string;
}

export interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  last_match_time?: string;
  similarity?: number;
  isPro?: boolean;
  isAppUser?: boolean;
  appUserId?: string;
  team_tag?: string;
}

export interface WinLossStats {
  win: number;
  lose: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface PlayerCounts {
  leaver_status: Record<string, { games: number; win: number }>;
  game_mode: Record<string, { games: number; win: number }>;
  lobby_type: Record<string, { games: number; win: number }>;
  lane_role: Record<string, { games: number; win: number }>;
  region: Record<string, { games: number; win: number }>;
  patch: Record<string, { games: number; win: number }>;
  is_radiant?: Record<string, { games: number; win: number }>;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  hero_id: number;
  start_time: number;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage?: number;
  tower_damage?: number;
  last_hits?: number;
  hero_healing?: number;
  lane?: number | null;
  lane_role?: number | null;
}

export interface ChatMessage {
  time: number;
  type: string;
  unit?: string;
  key: string;
  slot?: number;
  player_slot?: number;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface PermanentBuff {
  permanent_buff: string;
  stack_count: number;
}

export interface MatchObjective {
  time: number;
  type: string;
  unit?: string;
  key?: string;
  slot?: number;
  player_slot?: number;
  team?: number;
}

export interface MatchDetails {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
  radiant_score: number;
  dire_score: number;
  game_mode: number;
  lobby_type: number;
  region: number;
  patch: number;
  first_blood_time: number;
  radiant_gold_adv: number[];
  radiant_xp_adv: number[];
  chat?: ChatMessage[];
  picks_bans?: PickBan[];
  objectives?: MatchObjective[];
  players: {
    account_id: number;
    personaname: string;
    hero_id: number;
    kills: number;
    deaths: number;
    assists: number;
    last_hits: number;
    denies: number;
    gold_per_min: number;
    xp_per_min: number;
    level: number;
    net_worth: number;
    hero_damage: number;
    tower_damage: number;
    hero_healing: number;
    item_0: number;
    item_1: number;
    item_2: number;
    item_3: number;
    item_4: number;
    item_5: number;
    item_neutral: number;
    player_slot: number;
    permanent_buffs?: PermanentBuff[];
    benchmarks?: {
      gold_per_min: { raw: number; pct: number };
      xp_per_min: { raw: number; pct: number };
      hero_damage_per_min: { raw: number; pct: number };
      hero_healing_per_min: { raw: number; pct: number };
      tower_damage: { raw: number; pct: number };
      last_hits_per_min: { raw: number; pct: number };
      lhten: { raw: number; pct: number };
    };
    stuns?: number;
    multi_kills?: Record<string, number>;
    kill_streaks?: Record<string, number>;
    hero_damage_targets?: Record<string, number>;
    hero_damage_taken?: number;
    kill_log?: { time: number; key: string }[];
    camps_stacked?: number;
    obs_placed?: number;
    sen_placed?: number;
    actions_per_min?: number;
    lane_efficiency_pct?: number;
    buyback_count?: number;
    lane?: number;
    lane_role?: number;
    is_roaming?: boolean;
    aegis_snatched?: number;
    first_blood?: number;
    purchase_log?: { time: number; key: string }[];
    buyback_log?: { time: number; slot: number; type: string; player_slot: number }[];
    avatar?: string;
    avatarfull?: string;
  }[];
  version?: number;
}

export interface Peer {
  account_id: number;
  last_played: number;
  win: number;
  games: number;
  with_win: number;
  with_games: number;
  against_win: number;
  against_games: number;
  personaname: string;
  avatar: string;
  avatarfull?: string;
}

export interface PlayerHero {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

export interface PlayerMatchFilters {
  win?: number;
  hero_id?: number;
  game_mode?: number;
  lobby_type?: number;
  date?: number;
  limit?: number;
  offset?: number;
}

export interface LiveGame {
  match_id: number;
  server_id: string;
  lobby_id: string;
  game_time: number;
  average_mmr: number;
  radiant_score: number;
  dire_score: number;
  radiant_lead: number;
  spectators: number;
  game_mode: number;
  building_state?: number;
  players: {
    account_id: number;
    hero_id: number;
    name?: string;
    team?: number;
  }[];
}

export interface GlobalRecord {
  match_id: number;
  score: number;
  start_time: number;
}

export interface ProPlayer {
  account_id: number;
  steamid: string;
  avatar: string;
  personaname: string;
  full_name: string;
  name?: string;
  team_id: number;
  team_name: string;
  team_tag: string;
  country_code: string;
}

export interface ProTeam {
  team_id: number;
  rating: number;
  wins: number;
  losses: number;
  last_match_time: number;
  name: string;
  tag: string;
  logo_url?: string;
}

export interface League {
  leagueid: number;
  ticket: string | null;
  banner: string | null;
  tier: 'premium' | 'professional' | 'amateur' | 'excluded' | null;
  name: string;
}

export interface HeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  pub_pick: number;
  pub_win: number;
  '1_pick': number; '1_win': number;
  '2_pick': number; '2_win': number;
  '3_pick': number; '3_win': number;
  '4_pick': number; '4_win': number;
  '5_pick': number; '5_win': number;
  '6_pick': number; '6_win': number;
  '7_pick': number; '7_win': number;
  '8_pick': number; '8_win': number;
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  turbo_picks: number;
  turbo_wins: number;
}

export interface ProMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_team_id: number | null;
  radiant_name: string | null;
  dire_team_id: number | null;
  dire_name: string | null;
  leagueid: number;
  league_name: string;
  series_id: number;
  series_type: number;
  radiant_score: number;
  dire_score: number;
  radiant_win: boolean | null;
}

export interface WordCloudData {
  my_word_counts: Record<string, number>;
  all_word_counts: Record<string, number>;
}

export interface WardMapData {
  obs: Record<string, Record<string, number>>;
  sen: Record<string, Record<string, number>>;
}

export interface PlayerRating {
  account_id: number;
  match_id: number | null;
  solo_competitive_rank: number | null;
  competitive_rank: number | null;
  time: number;
}

export interface HeroMatchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

export interface HeroDuration {
  duration_bin: number;
  games_played: number;
  wins: number;
}

export interface HeroItemPopularity {
  start_game_items: Record<string, number>;
  early_game_items: Record<string, number>;
  mid_game_items: Record<string, number>;
  late_game_items: Record<string, number>;
}

export interface ItemTimingScenario {
  hero_id: number;
  item: string;
  time: number;
  games: number;
  wins: number;
}

export interface LaneRoleScenario {
  hero_id: number;
  lane_role: number;
  time: number;
  games: number;
  wins: number;
}

export interface DistributionData {
  ranks: {
    rows: {
      bin: number;
      bin_name: number;
      count: number;
      cumulative_sum: number;
    }[];
    sum: {
      count: number;
    };
  };
}

export interface MiscScenario {
  scenario: string;
  is_radiant: boolean;
  region: number;
  rank: number;
  wins: number;
  games: number;
}
