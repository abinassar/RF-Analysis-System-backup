import { Injectable } from '@angular/core';
import { HttpClient, 
          HttpEvent, 
          HttpHeaders, 
          HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor( private http: HttpClient ) { }

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
}
