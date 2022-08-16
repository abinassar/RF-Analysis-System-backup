import { Component } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private screenOrientation: ScreenOrientation) {
    // get current
    console.log(this.screenOrientation.type); // logs the current orientation, example: 'landscape'

    // set to landscape
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

    // allow user rotate
    this.screenOrientation.unlock();

    // detect orientation changes
    this.screenOrientation.onChange().subscribe(
      () => {
          console.log("Orientation Changed");
      }
    );
  }

}
