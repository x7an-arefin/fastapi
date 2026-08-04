import { ApplicationConfig, provideZonelessChangeDetection, APP_INITIALIZER, inject, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIcons } from '@ng-icons/core';
import * as heroIconsOutline from '@ng-icons/heroicons/outline';
import * as heroIconsSolid from '@ng-icons/heroicons/solid';

import { appRoutes } from '@app/app.routes';
import { correlationInterceptor } from '@core/http/correlation.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { authInitFactory } from '@core/auth/auth-init.factory';
import { AuthService } from '@core/auth/auth.service';
import { GlobalErrorHandler } from '@core/error-handling/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([correlationInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideIcons({ ...heroIconsOutline, ...heroIconsSolid }),
    {
      provide: APP_INITIALIZER,
      useFactory: authInitFactory,
      deps: [AuthService],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
