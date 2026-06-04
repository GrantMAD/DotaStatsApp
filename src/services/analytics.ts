import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeroStats, MatchDetails, PlayerProfile } from './types';    

export type EventType =
  | 'app_launch'
  | 'screen_view'
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'search'
  | 'hero_view'
  | 'match_view'
  | 'profile_view'
  | 'friend_action'
  | 'notification_open'
  | 'setting_change'
  | 'error'
  | 'comparison_view'
  | 'live_match_view'
  | 'opendota_player_search'
  | 'opendota_match_view'
  | 'opendota_player_view'
  | 'opendota_hero_view'
  | 'opendota_meta_interaction'
  | 'opendota_hero_snapshot'
  | 'opendota_match_snapshot'
  | 'opendota_player_snapshot';

interface AnalyticsEventPayload {
  eventType: EventType;
  metadata?: Record<string, any>;
  route?: string;
}

interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  event_type: EventType;
  metadata?: Record<string, any>;
  platform: 'mobile';
  route?: string;
  session_id: string;
  created_at?: string;
}

export interface RecentlyViewedItem {
  id: string;
  type: 'hero' | 'match' | 'player';
  entityId: string | number;
  title: string;
  subtitle?: string;
  timestamp: string;
}

const SESSION_ID_KEY = 'dota_app_session_id';
let sessionId = '';
let pendingEvents: AnalyticsEvent[] = [];
let isSubmitting = false;

/**
 * Initialize analytics session
 */
export async function initializeAnalytics(): Promise<void> {
  try {
    let storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);

    if (!storedSessionId) {
      storedSessionId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(SESSION_ID_KEY, storedSessionId);
    }

    sessionId = storedSessionId;

    // Track app launch
    await trackEvent({
      eventType: 'app_launch',
    });
  } catch (err) {
    console.warn('Analytics initialization error:', err);
  }
}

/**
 * Get current session ID
 */
export function getSessionId(): string {
  return sessionId || `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track an analytics event (queues for batch submission)
 */
export async function trackEvent(payload: AnalyticsEventPayload): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event: AnalyticsEvent = {
      user_id: user?.id,
      event_type: payload.eventType,
      metadata: payload.metadata || {},
      platform: 'mobile',
      route: payload.route,
      session_id: getSessionId(),
    };

    // Queue the event
    pendingEvents.push(event);

    // Submit if we have enough events or periodically
    if (pendingEvents.length >= 10) {
      await submitPendingEvents();
    }
  } catch (err) {
    console.warn('Analytics tracking error:', err);
  }
}

/**
 * Fetch recently viewed items for the current user or session
 */
export async function getRecentlyViewed(limit: number = 10): Promise<RecentlyViewedItem[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('analytics_events')
      .select('*')
      .in('event_type', [
        'hero_view', 
        'match_view', 
        'profile_view', 
        'opendota_match_view', 
        'opendota_player_view', 
        'opendota_hero_view'
      ])
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', getSessionId());
    }

    const { data, error } = await query.limit(limit * 3); // Fetch more to filter duplicates effectively

    if (error) throw error;
    if (!data) return [];

    // Filter duplicates and map to RecentlyViewedItem
    const seen = new Set<string>();
    const items: RecentlyViewedItem[] = [];

    for (const event of data) {
      if (items.length >= limit) break;

      let type: 'hero' | 'match' | 'player' = 'hero';
      let entityId: string | number = '';
      let title = '';
      let subtitle = '';

      const metadata = event.metadata || {};

      if (event.event_type.includes('hero')) {
        type = 'hero';
        entityId = metadata.heroId || metadata.hero_id;
        title = metadata.heroName || metadata.name || 'Unknown Hero';
        subtitle = 'Hero Profile';
      } else if (event.event_type.includes('match')) {
        type = 'match';
        entityId = metadata.matchId || metadata.match_id;
        title = `Match ${entityId}`;
        subtitle = metadata.isLive ? 'Live Match' : 'Match Details';
      } else if (event.event_type.includes('player') || event.event_type === 'profile_view') {
        type = 'player';
        entityId = metadata.accountId || metadata.account_id || metadata.profileId;
        title = metadata.name || metadata.personaname || `Player ${entityId}`;
        subtitle = metadata.section ? `Player ${metadata.section}` : 'Player Profile';
      }

      const key = `${type}_${entityId}`;
      if (entityId && !seen.has(key)) {
        seen.add(key);
        items.push({
          id: event.id!,
          type,
          entityId,
          title,
          subtitle,
          timestamp: event.created_at!,
        });
      }
    }

    return items;
  } catch (err) {
    console.warn('Error fetching recently viewed:', err);
    return [];
  }
}

/**
 * Fetch recent searches for the current user or session
 */
export async function getRecentSearches(limit: number = 5): Promise<string[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('analytics_events')
      .select('metadata')
      .in('event_type', ['search', 'opendota_player_search'])
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', getSessionId());
    }

    const { data, error } = await query.limit(limit * 5); // Fetch extra to filter uniques

    if (error) throw error;
    if (!data) return [];

    const uniqueSearches = new Set<string>();
    const results: string[] = [];

    for (const event of data) {
      if (results.length >= limit) break;

      const metadata = event.metadata || {};
      const queryStr = metadata.query;

      if (queryStr && typeof queryStr === 'string' && !uniqueSearches.has(queryStr)) {
        uniqueSearches.add(queryStr);
        results.push(queryStr);
      }
    }

    return results;
  } catch (err) {
    console.warn('Error fetching recent searches:', err);
    return [];
  }
}

/**
 * Fetch community trending data (heroes and searches)
 * Aggregates data from the last 48 hours
 */
export async function getCommunityTrending(): Promise<{ 
  heroes: Array<{ id: number, name: string, count: number }>, 
  searches: string[] 
}> {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('event_type, metadata')
      .in('event_type', ['hero_view', 'opendota_hero_view', 'search', 'opendota_player_search'])
      .gte('created_at', fortyEightHoursAgo);

    if (error) throw error;
    if (!events) return { heroes: [], searches: [] };

    // Aggregate Hero Views
    const heroCounts: Record<number, { id: number, name: string, count: number }> = {};
    // Aggregate Searches
    const searchCounts: Record<string, number> = {};

    events.forEach((event) => {
      const metadata = event.metadata || {};
      
      if (event.event_type.includes('hero')) {
        const heroId = metadata.heroId || metadata.hero_id;
        const heroName = metadata.heroName || metadata.name;
        
        if (heroId) {
          if (!heroCounts[heroId]) {
            heroCounts[heroId] = { id: heroId, name: heroName || `Hero ${heroId}`, count: 0 };
          }
          heroCounts[heroId].count++;
        }
      } else if (event.event_type.includes('search')) {
        const query = metadata.query;
        if (query && typeof query === 'string' && query.trim().length > 1) {
          const normalizedQuery = query.trim().toLowerCase();
          searchCounts[normalizedQuery] = (searchCounts[normalizedQuery] || 0) + 1;
        }
      }
    });

    // Sort and limit
    const trendingHeroes = Object.values(heroCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const trendingSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query);

    return {
      heroes: trendingHeroes,
      searches: trendingSearches,
    };
  } catch (err) {
    console.warn('Error fetching community trending:', err);
    return { heroes: [], searches: [] };
  }
}

/**
 * Submit pending events to Supabase
 */
export async function submitPendingEvents(): Promise<void> {
  if (isSubmitting || pendingEvents.length === 0) {
    return;
  }

  isSubmitting = true;

  try {
    const eventsToSubmit = [...pendingEvents];
    pendingEvents = [];

    const { error } = await supabase.from('analytics_events').insert(eventsToSubmit);

    if (error) {
      console.error('Failed to submit analytics events:', error);
      // Re-queue events on failure (simple retry)
      pendingEvents = [...eventsToSubmit, ...pendingEvents];
    }
  } catch (err) {
    console.warn('Analytics submission error:', err);
  } finally {
    isSubmitting = false;
  }
}

/**
 * Force submit all pending events (call before app backgrounding)
 */
export async function flushAnalytics(): Promise<void> {
  await submitPendingEvents();
}

/**
 * Track screen view
 */
export async function trackScreenView(screenName: string): Promise<void> {
  await trackEvent({
    eventType: 'screen_view',
    route: screenName,
    metadata: { screenName },
  });
}

/**
 * Track authentication events
 */
export async function trackSignIn(): Promise<void> {
  await trackEvent({
    eventType: 'sign_in',
  });
}

export async function trackSignUp(): Promise<void> {
  await trackEvent({
    eventType: 'sign_up',
  });
}

export async function trackSignOut(): Promise<void> {
  await trackEvent({
    eventType: 'sign_out',
  });
  // Flush before signing out
  await flushAnalytics();
}

/**
 * Track hero-related events
 */
export async function trackHeroView(heroId: number, heroName: string): Promise<void> {
  await trackEvent({
    eventType: 'hero_view',
    metadata: { heroId, heroName },
  });
}

/**
 * Track match-related events
 */
export async function trackMatchView(matchId: string): Promise<void> {
  await trackEvent({
    eventType: 'match_view',
    metadata: { matchId },
  });
}

export async function trackLiveMatchView(matchId: string): Promise<void> {
  await trackEvent({
    eventType: 'live_match_view',
    metadata: { matchId },
  });
}

/**
 * Track profile view
 */
export async function trackProfileView(profileId: string): Promise<void> {
  await trackEvent({
    eventType: 'profile_view',
    metadata: { profileId },
  });
}

/**
 * Track search
 */
export async function trackSearch(query: string, resultsCount: number): Promise<void> {
  await trackEvent({
    eventType: 'search',
    metadata: { query, resultsCount },
  });
}

/**
 * Track friend actions
 */
export async function trackFriendAction(action: 'add' | 'remove', userId: string): Promise<void> {
  await trackEvent({
    eventType: 'friend_action',
    metadata: { action, userId },
  });
}

/**
 * Track comparison view
 */
export async function trackComparisonView(
  comparisonType: string,
  itemsCount: number
): Promise<void> {
  await trackEvent({
    eventType: 'comparison_view',
    metadata: { comparisonType, itemsCount },
  });
}

/**
 * Track notification open
 */
export async function trackNotificationOpen(notificationType: string): Promise<void> {
  await trackEvent({
    eventType: 'notification_open',
    metadata: { notificationType },
  });
}

/**
 * Track error
 */
export async function trackError(errorType: string, message: string): Promise<void> {
  await trackEvent({
    eventType: 'error',
    metadata: { errorType, message },
  });
}

/**
 * Track OpenDota specific interactions
 */
export async function trackOpenDotaPlayerSearch(query: string, resultsCount: number): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_search',
    metadata: { query, resultsCount },
  });
}

export async function trackOpenDotaMatchView(matchId: string, isLive: boolean = false): Promise<void> {
  await trackEvent({
    eventType: 'opendota_match_view',
    metadata: { matchId, isLive },
  });
}

export async function trackOpenDotaPlayerView(accountId: string, section: string = 'overview'): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_view',
    metadata: { accountId, section },
  });
}

export async function trackOpenDotaHeroView(heroId: number, heroName: string, section: string = 'overview'): Promise<void> {
  await trackEvent({
    eventType: 'opendota_hero_view',
    metadata: { heroId, heroName, section },
  });
}

export async function trackOpenDotaMetaInteraction(tool: string, action?: string): Promise<void> {
  await trackEvent({
    eventType: 'opendota_meta_interaction',
    metadata: { tool, action },
  });
}

/**
 * Track OpenDota Data Snapshots (Rich Metadata)
 */
export async function trackHeroSnapshot(heroData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_hero_snapshot',
    metadata: {
      hero_id: heroData.id,
      name: heroData.localized_name || heroData.name,
      win_rate_pub: heroData.pub_win_rate,
      win_rate_pro: heroData.pro_win_rate,
      pick_rate: heroData.pick_rate,
      ban_rate: heroData.ban_rate,
      primary_attribute: heroData.primary_attr,
      roles: heroData.roles,
    },
  });
}

export async function trackMatchSnapshot(matchData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_match_snapshot',
    metadata: {
      match_id: matchData.match_id,
      duration: matchData.duration,
      outcome: matchData.radiant_win ? 'radiant_win' : 'dire_win',
      final_score: {
        radiant: matchData.radiant_score,
        dire: matchData.dire_score,
      },
      game_mode: matchData.game_mode,
      lobby_type: matchData.lobby_type,
    },
  });
}

export async function trackPlayerSnapshot(playerData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_snapshot',
    metadata: {
      account_id: playerData.profile?.account_id,
      rank_tier: playerData.rank_tier,
      is_pro: !!playerData.profile?.name,
      plus_subscriber: playerData.profile?.plus,
    },
  });
}

/**
 * Set up periodic flushing (call from app root)
 */
export function setupAnalyticsPeriodicFlushing(intervalMs: number = 30000): () => void {
  const intervalId = setInterval(() => {
    submitPendingEvents();
  }, intervalMs);

  return () => clearInterval(intervalId);
}
