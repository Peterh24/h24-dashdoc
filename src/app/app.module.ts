import { IonicStorageModule } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { NgModule, inject, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { concatMap, forkJoin, from, mergeMap, of, take, tap } from 'rxjs';
import { JWT_KEY, USER_STORAGE_KEY } from './services/constants';
import { AuthService } from './services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const platform = inject(Platform);
  const tokenObs = from(storage.get(USER_STORAGE_KEY));
  const h24token = from(storage.get(JWT_KEY));
  const router = inject(Router);
  const authService = inject(AuthService)

  return forkJoin ({tokenObs, h24token}).pipe (concatMap (tokens => {
    const currentUrl = platform.url();

    if (!req.headers?.get ("Authorization")) {
      if (req.url.includes('api.dashdoc.eu')) {
        if (!currentUrl.includes('/private/tabs/home') && tokens.tokenObs) {
          req = req.clone({
            setHeaders: {
              Authorization: `Token ${tokens.tokenObs}`
            }
          });
        }
      } else if (tokens.h24token && req.url.includes('api.h24transports.com') || isDevMode() && req.url.includes('localhost')) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${tokens.h24token}`
          }
        });

        // Check for 401 errors for all requests
        return next(req).pipe(
          tap({
            next: (event) => {
              // success
            },
            error: (error) => {
              if (error.status === 401) {
                // if token expired, remove token from application and redirect to home
                authService.signOut()
                router.navigate(['/'], { replaceUrl: true });
              }
            }
          })
        );
      }
    }

    return next(req);
  }));
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(
      {
        hardwareBackButton: true,
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
