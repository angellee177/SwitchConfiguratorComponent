import { InjectionToken } from '@angular/core';

/** Absolute or same-origin base URL for switch-plate routes (no trailing slash). */
export const API_SWITCH_PLATE_BASE_URL = new InjectionToken<string>(
  'API_SWITCH_PLATE_BASE_URL',
);
