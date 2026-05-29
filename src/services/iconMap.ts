import { Ionicons } from '@expo/vector-icons';

export const ICON_MAP = {
  HOME: 'home',
  SEARCH: 'search',
  FRIENDS: 'people',
  META: 'analytics',
  PRO: 'star',
  PROFILE: 'person',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  MATCH: 'game-controller',
  HERO: 'body',
  WIN: 'trophy',
  LOSS: 'skull',
  TREND_UP: 'trending-up',
  TREND_DOWN: 'trending-down',
  BAN: 'ban',
  FLAME: 'flame',
  GLOBE: 'globe',
  LOCK: 'lock-closed',
  MAIL: 'mail',
  EYE: 'eye',
  EYE_OFF: 'eye-off',
  ARROW_BACK: 'arrow-back',
  CHEVRON_FORWARD: 'chevron-forward',
  CHEVRON_BACK: 'chevron-back',
  CHECKMARK: 'checkmark',
  ADD: 'add',
  CLOSE: 'close',
  ALERT: 'alert-circle',
  INFO: 'information-circle',
} as const;

export type IconName = keyof typeof ICON_MAP;
export type IoniconsName = typeof ICON_MAP[IconName];

export function getIcon(name: IconName): any {
  return ICON_MAP[name];
}
