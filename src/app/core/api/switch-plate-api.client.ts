import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_SWITCH_PLATE_BASE_URL } from '../tokens/api-switch-plate-base-url.token';
import type {
  ApiSuccessResponse,
  SwitchPlateConfigResultDto,
} from '../domains/models/switch-plate-config-api.model';

/**
 * Low-level HTTP access to the switch-plate API (infrastructure).
 */
@Injectable({ providedIn: 'root' })
export class SwitchPlateApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_SWITCH_PLATE_BASE_URL);

  getConfig(): Observable<SwitchPlateConfigResultDto> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/config`;
    return this.http
      .get<ApiSuccessResponse<SwitchPlateConfigResultDto>>(url)
      .pipe(
        map((res) => {
          if (!res?.success || res.result == null) {
            throw new Error(res?.message || 'Switch plate config request failed');
          }
          return res.result;
        }),
      );
  }
}
