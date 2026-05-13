/**
 * Public surface for `app/core` (clean architecture — domain + infrastructure wiring).
 */
export { API_SWITCH_PLATE_BASE_URL } from './tokens/api-switch-plate-base-url.token';
export type {
  ColourCombination,
  ConfigOption,
  MechOption,
  ProductMap,
  StyleOption,
} from './domains/models/switch-plate-catalog.model';
export { SwitchPlateApiClient } from './api/switch-plate-api.client';
export { SwitchPlateCatalogService } from './domains/services/switch-plate-catalog.service';
