import { IonicStorageModule } from '@ionic/storage-angular';
import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { from, switchMap } from 'rxjs';
import { USER_STORAGE_KEY } from './services/constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const platform = inject(Platform);
  const tokenObs = from(storage.get(USER_STORAGE_KEY));

  return tokenObs.pipe(
    switchMap((token) => {
      const currentUrl = platform.url();
      console.log('req: ', req);
      if(req.url.includes('app.pennylane.com')){
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer 9vPF8rbIvtMoksQyhVBLWtqwjYflTx9z4-LCqZ2PFwY`
          }
        });
      } else if(req.url.includes('api.dashdoc.eu')) {
        if(!currentUrl.includes('/private/tabs/home') && token ) {
          req = req.clone({
            setHeaders: {
              Authorization: `Token ${token}`
            }
          });
        }
      }

      return next(req);
    })
  )
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot({
      driverOrder: [
        cordovaSQLiteDriver._driver,
        Drivers.IndexedDB,
        Drivers.LocalStorage
      ]
    })
  ],

  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
