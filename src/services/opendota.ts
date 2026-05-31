export * from './apiUtils';
export * from './types';
export * from './playerService';
export * from './matchService';
export * from './heroService';
export * from './proSceneService';

import * as playerService from './playerService';
import * as matchService from './matchService';
import * as heroService from './heroService';
import * as proSceneService from './proSceneService';

export const openDotaApi = {
  ...playerService,
  ...matchService,
  ...heroService,
  ...proSceneService,
};
