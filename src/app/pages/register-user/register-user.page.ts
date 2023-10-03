import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignInService } from '../sign-in/sign-in.service';
import { AlertService, DataService } from '@shared/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.page.html',
  styleUrls: ['./register-user.page.scss'],
})
export class RegisterUserPage implements OnInit {

  signUpForm: FormGroup;

  constructor( private fb: FormBuilder,
               private signinService: SignInService,
               private alertService: AlertService,
               private dataService: DataService,
               public router: Router ) { }

  ngOnInit() {

    this.signUpForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })

  }

  async signUp() {

    if (this.signUpForm.valid) {

      this.alertService.showLoading("Creando usuario");
      
      let email = this.signUpForm.get('email').value;
      let password = this.signUpForm.get('password').value;

      try {

        const createdUser = await this.signinService.SignUp(email, password);
        await this.signinService.SetUserData(createdUser.user);
        await this.dataService.setLinkData(createdUser.user);
        await this.signinService.SendVerificationMail(email);
        this.alertService.closeLoading();

        this.router.navigate(['verify-email-address', email]);

        
      } catch (error: any) {
        this.alertService.closeLoading();
        let errorMessage: string = error.message;
        let alertMessage: string = errorMessage;

        if (errorMessage.includes("email-already-in-use")) {
          alertMessage = `El correo '${email}' ya esta registrado, prueba un correo diferente`;
        }
        this.alertService.presentAlert("Error", alertMessage);
      }    
    }
  }
}
