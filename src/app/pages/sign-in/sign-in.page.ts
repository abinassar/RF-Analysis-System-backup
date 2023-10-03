import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AntennaSelected } from 'src/app/shared/models';
import { SignInService } from './sign-in.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { AlertService } from '@shared/services';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  signInForm: FormGroup;
  allUsers: any;
  year: number;

  constructor( private fb: FormBuilder,
               private signinService: SignInService,
               private router: Router,
               private alertService: AlertService ) { }

  ngOnInit() {

    let date = new Date();
    this.year = date.getFullYear();

    this.signInForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })

  }

  login() {

    console.log("sign in form ", this.signInForm)

    if (this.signInForm.valid) {

      this.alertService.showLoading("Iniciando sesión");
      
      let email = this.signInForm.get('email').value;
      let password = this.signInForm.get('password').value;

      this.signinService.SignIn(
        email,
        password
      ).then((result) => {
        console.log("result ", result)

        const user = result.user;

        if (!user.emailVerified) {
          this.alertService.closeLoading();
          this.alertService.presentAlert("Error", "Email no verificado");
          return;
        }

        result.user.getIdToken().then((token) => {

          const accessToken = token;
          this.alertService.closeLoading();
          localStorage.setItem("token", accessToken);
          this.router.navigate(['home']);
        });

      })
      .catch((error) => {
        let errorMessage: string = error.message;
        let alertMessage: string = errorMessage;
        this.alertService.closeLoading();

        if (errorMessage.includes("(auth/user-not-found)")) {
          alertMessage = "Usuario o contraseña incorrectos";
        }
        
        this.alertService.presentAlert("Error", alertMessage);
      });

    }

  }

}
