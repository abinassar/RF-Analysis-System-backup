import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeviceOrientation } from '@ionic-native/device-orientation/ngx';

//IMPORT THE PLUGINS
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

// Firebase

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from "../environments/environment";

// Http modules

import { HttpBackend, 
         HttpXhrBackend } from '@angular/common/http';
import { NativeHttpModule, 
         NativeHttpBackend, 
         NativeHttpFallback } from 'ionic-native-http-connection-backend';
import { Platform } from '@ionic/angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NativeHttpModule
  ],
  providers: [{ 
    provide: RouteReuseStrategy, 
    useClass: IonicRouteStrategy 
    },
    DeviceOrientation,
    Geolocation,
    NativeGeocoder,
    {
      provide: HttpBackend, 
      useClass: NativeHttpFallback, 
      deps: [
        Platform, 
        NativeHttpBackend, 
        HttpXhrBackend
      ]
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
