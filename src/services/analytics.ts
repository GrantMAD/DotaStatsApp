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
  user_id?: string;
  event_type: EventType;
  metadata?: Record<string, any>;
  platform: 'mobile';
  route?: string;
  session_id: string;
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
