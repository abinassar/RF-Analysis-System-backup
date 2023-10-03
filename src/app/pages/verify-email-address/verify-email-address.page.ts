import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email-address',
  templateUrl: './verify-email-address.page.html',
  styleUrls: ['./verify-email-address.page.scss'],
})
export class VerifyEmailAddressPage implements OnInit {

  email: string = '';

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const routeSnapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot;
    
    this.email = routeSnapshot.paramMap.get("email");
    
  }

  goToLogin() {

    this.router.navigate(["/sign-in"])

  }

}
