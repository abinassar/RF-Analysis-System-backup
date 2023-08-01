import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email-address',
  templateUrl: './verify-email-address.page.html',
  styleUrls: ['./verify-email-address.page.scss'],
})
export class VerifyEmailAddressPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToLogin() {

    this.router.navigate(["/sign-in"])

  }

}
