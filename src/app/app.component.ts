import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  settingsForm: FormGroup;

  constructor( private formBuilder: FormBuilder,
               private settingsService: SettingsService,
               private menu: MenuController ) {}

  ngOnInit(): void {
   
    this.settingsForm = this.formBuilder.group({
      anthenaOneHigh: this.formBuilder.control(1000),
      anthenaTwoHigh: this.formBuilder.control(1000)
    })
    
  }

  saveSettings() {
    let settings = {
      anthenaOneHigh: this.settingsForm.get("anthenaOneHigh").value,
      anthenaTwoHigh: this.settingsForm.get("anthenaTwoHigh").value      
    }

    this.settingsService.linkSettings.next(settings);

    this.closeConfiguration();

  }

  closeConfiguration() {
    this.menu.close('first');
  }
}
