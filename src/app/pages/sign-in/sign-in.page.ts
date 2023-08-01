import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AntennaSelected } from 'src/app/shared/models';
import { SignInService } from './sign-in.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  signInForm: FormGroup;
  allUsers: any;

  constructor( private fb: FormBuilder,
               private signinService: SignInService ) { }

  ngOnInit() {

    this.signInForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })

  }

  login() {

    console.log("sign in form ", this.signInForm)

    if (this.signInForm.valid) {
      
      let email = this.signInForm.get('email').value;
      let password = this.signInForm.get('password').value;

      this.signinService.SignIn(
        email,
        password
      );

    
    }

  }

}
