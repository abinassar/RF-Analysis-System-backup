import { Component, OnInit } from '@angular/core';
import { Antenna } from '../../models';

@Component({
  selector: 'app-antenna-list',
  templateUrl: './antenna-list.component.html',
  styleUrls: ['./antenna-list.component.scss'],
})
export class AntennaListComponent implements OnInit {

  antennaList: Antenna[] = [
    {
      name: "AIRMAX U-OMT-DISH-5",
      imgPath: "https://www.crsl.es/9909-large_default/ubiquiti-airmax-u-omt-dish-5-antena-dish-de-5ghz-de-27dbi-con-soporte.jpg",
      efficiency: 27,
      frecuency: 5,
      wavelength: 5,
      gain: 5
    }
  ];

  constructor() { }

  ngOnInit() {}

}
