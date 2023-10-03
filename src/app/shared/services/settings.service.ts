import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { GeoPoint, defaultPoints } from '../models/geographic';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentSnapshot,
} from '@angular/fire/compat/firestore';
import { LinkSettings, defaultLinkSettings } from '@shared/models';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Link settings

  linkSettings: LinkSettings = defaultLinkSettings;
  linkSettingsList: LinkSettings[];

  setLinkSettings = new Subject<any>();
  setLinkSettings$ = this.setLinkSettings.asObservable();

  updateGeoPoints = new Subject<void>();
  updateGeoPoints$ = this.updateGeoPoints.asObservable();

  frecuency: number;
  linkDistance: number = 0;

  // Atomospheric atributes

  atmosphericPressure: number = 0;
  temperature: number = 0;
  waterDensity: number = 0;
  locationName: string = "";

  // Geographic settings

  showTabs: boolean = true;

  constructor(public afs: AngularFirestore,
              public afAuth: AngularFireAuth,
              private db: AngularFirestore) { }

  SetUserLinkSettingsData(userId: string, linkSettings: LinkSettings[]) {

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`LinkSettings/${userId}`);

    return userRef.get().pipe(
      take(1),
      mergeMap((doc: DocumentSnapshot<any>) => {
        if (!doc.exists) {

          return userRef.set({ linkSettings: linkSettings }, { merge: true });

        } else {

          return userRef.update({ linkSettings: linkSettings });
          
        }
      })
    );
    
  }

  getUserLinks(userId: string) {
    return new Promise<any>((resolve, reject) => {
      this.db
          .collection('LinkSettings')
          .doc(userId)
          .get()
          .subscribe(userLinks => {
            resolve(userLinks.data());
            }, error => {
              reject(error);
            });
          });
  }

  getUserById(userId: string) {
    return new Promise<any>((resolve, reject) => {
      this.db.collection('users').doc(userId).get().subscribe(user => {
        resolve(user.data());
      }, error => {
        reject(error);
      });
    });
  }
}
