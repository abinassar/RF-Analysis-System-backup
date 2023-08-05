import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GlobalMapComponent } from './components/global-map/global-map.component';
import { TruncatePipe } from './pipes';
import { OptionsModalComponent } from './components/options-modal/options-modal.component';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

@NgModule({
  declarations: [
    GlobalMapComponent,
    TruncatePipe,
    OptionsModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    GlobalMapComponent,
    TruncatePipe,
    OptionsModalComponent
  ],
  providers: [
    ScreenOrientation
  ]
})
export class SharedModule { }
