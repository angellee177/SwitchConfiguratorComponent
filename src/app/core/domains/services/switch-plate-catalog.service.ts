import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { SwitchPlateApiClient } from '../../api/switch-plate-api.client';
import { mapSwitchPlateConfigToCatalog } from '../../mappers/switch-plate-catalog.mapper';
import type { ProductMap } from '../models/switch-plate-catalog.model';

/**
 * Application use-case: load catalog for the configurator (single entry from UI).
 */
@Injectable({ providedIn: 'root' })
export class SwitchPlateCatalogService {
  private readonly api = inject(SwitchPlateApiClient);

  loadCatalog(): Observable<ProductMap> {
    return this.api.getConfig().pipe(map((dto) => mapSwitchPlateConfigToCatalog(dto)));
  }
}
