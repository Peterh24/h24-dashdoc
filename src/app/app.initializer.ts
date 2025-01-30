import { APP_INITIALIZER, Provider } from '@angular/core';
import { AppInitService } from './services/app-init.service';

export function appInitializerFactory(appInitService: AppInitService) {
  return () => appInitService.loadConfig();
}

export const APP_INIT_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: appInitializerFactory,
  deps: [AppInitService],
  multi: true,
};
