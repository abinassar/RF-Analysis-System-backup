import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignInService } from '../../sign-in.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.page.html',
  styleUrls: ['./register-user.page.scss'],
})
export class RegisterUserPage implements OnInit {

  signUpForm: FormGroup;

  constructor( private fb: FormBuilder,
               private signinService: SignInService ) { }

  ngOnInit() {

    this.signUpForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })

  }

  signUp() {

    if (this.signUpForm.valid) {
      
      let email = this.signUpForm.get('email').value;
      let password = this.signUpForm.get('password').value;

      this.signinService.SignUp(
        email,
        password
      )
    
    }

  }


}
