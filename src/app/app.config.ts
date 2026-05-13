import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { API_SWITCH_PLATE_BASE_URL } from './core/tokens/api-switch-plate-base-url.token';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: API_SWITCH_PLATE_BASE_URL, useValue: environment.apiSwitchPlateBaseUrl },
  ],
};
