import { Injectable } from '@angular/core';
import { HttpClient, 
          HttpEvent, 
          HttpHeaders, 
          HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AntennaSelected, LinkSettings } from '@shared/models';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor( private http: HttpClient,
               private db: AngularFirestore ) { }

    // Http service

  get(uri: string,
      params?: HttpParams,
      headers: HttpHeaders = new HttpHeaders({
                                                Accept: 'application/json'
                                              })): Observable<any> {

    return this.http.get<any>(uri, {
                                      headers, 
                                      params
                                    });
  }

  post(uri: string,
       body,
       params?: HttpParams,
       headers: HttpHeaders = new HttpHeaders({
                                                'Content-Type': 'application/json'
                                              })): Observable<any> {

    return this.http.post<any>(uri, 
                                body,
                                    {
                                      headers, 
                                      params
                                    });

  }  

  updateUserAntenna(_id:any, antennaSelected: AntennaSelected) {
    return this.db.doc(`users/${_id}`).update({antennaSelected});
  }

  updateUserLinkSettings(_id:any, linkSettings: LinkSettings) {
    return this.db.doc(`LinkSettings/${_id}`).update({linkSettings});
  }
}
