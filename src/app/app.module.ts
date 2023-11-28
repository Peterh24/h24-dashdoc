import { IonicStorageModule } from '@ionic/storage-angular';
import { Router } from '@angular/router';
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
import { concatMap, from, switchMap, take, tap } from 'rxjs';
import { API_URL, JWT_KEY, USER_STORAGE_KEY } from './services/constants';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const platform = inject(Platform);
  const tokenObs = from(storage.get(USER_STORAGE_KEY));
  const h24token = from(storage.get(JWT_KEY));
  const router = inject(Router);


  
  return tokenObs.pipe(
    concatMap((token) => {
      const currentUrl = platform.url();

      if (req.url.includes('api.dashdoc.eu')) {
        if (!currentUrl.includes('/private/tabs/home') && token) {
          req = req.clone({
            setHeaders: {
              Authorization: `Token ${token}`
            }
          });
        }
      } else if (req.url.includes('api.h24transports.com')) {
        return h24token.pipe(
          take(1),
          concatMap((token) => {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(req);
          })
        );
      }

      
      // Check for 401 errors for all requests
      return next(req).pipe(
        tap({
          next: (event) => {
            // success
          },
          error: (error) => {
            if (error.status === 401) {
              // if token expired, remove token from application and redirect to home
              storage.remove(USER_STORAGE_KEY);
              storage.remove(JWT_KEY);

              router.navigate(['/'], { replaceUrl: true });
            }
          }
        })
      );
    })
  );
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(
      {
        innerHTMLTemplatesEnabled : true
      }
    ),
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
