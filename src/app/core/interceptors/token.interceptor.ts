import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private router: Router) {

    }

  intercept(request: HttpRequest<any>, 
            next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    // Verificar si el token no está presente y ha expirado

    if (!token && this.isTokenExpired(token)) {

        localStorage.removeItem("token");
        this.router.navigate(['sign-in']).then();
        console.log("token expirado")
        
    }

    return next.handle(request);
  }

  isTokenExpired(token: string): boolean {
    // Obtener la fecha de vencimiento del token y comparar con la fecha actual
    const expirationDate = this.getTokenExpirationDate(token);
    return expirationDate < new Date();
  }

  getTokenExpirationDate(token: string): Date {
    const decodedToken = this.decodeToken(token);

    if (!decodedToken || !decodedToken.exp) {
      return null;
    }

    // Convertir el timestamp del token a una fecha
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);

    return expirationDate;
  }

  decodeToken(token: string): any {
    // Decodificar el token JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }
}