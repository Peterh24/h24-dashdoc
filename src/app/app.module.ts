import { IonicStorageModule } from '@ionic/storage-angular';
import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { from, switchMap } from 'rxjs';
import { USER_STORAGE_KEY } from './services/constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const tokenObs = from(storage.get(USER_STORAGE_KEY));
  console.log('req: ', req.url )

  return tokenObs.pipe(
    switchMap((token) => {
      console.log('Token in Interceptor: ', token)
      if(token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Token ${token}`
          }
        });
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
